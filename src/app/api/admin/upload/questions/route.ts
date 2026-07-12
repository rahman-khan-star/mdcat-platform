import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 500;
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"];
const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
];

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const quizId = formData.get("quiz_id") as string | null;

    if (!file) return errorResponse("No file provided", 400);
    if (!quizId) return errorResponse("quiz_id is required", 400);

    // Validate quiz_id is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(quizId)) {
      return errorResponse("Invalid quiz_id format", 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return errorResponse(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`, 400);
    }

    // Validate MIME type
    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && !file.type.startsWith("text/")) {
      return errorResponse("Invalid file MIME type", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rows.length === 0) return errorResponse("File is empty", 400);
    if (rows.length > MAX_ROWS) {
      return errorResponse(`Too many rows. Maximum is ${MAX_ROWS} questions per upload`, 400);
    }

    const questions: Array<{
      quiz_id: string;
      question_text: string;
      options: string[];
      correct_answer_index: number;
      explanation: string;
      sort_order: number;
    }> = [];

    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] as Record<string, unknown>;
      const questionText = String(row.question || row.Question || "").trim();
      const optionA = String(row.option_a || row.OptionA || row.A || "").trim();
      const optionB = String(row.option_b || row.OptionB || row.B || "").trim();
      const optionC = String(row.option_c || row.OptionC || row.C || "").trim();
      const optionD = String(row.option_d || row.OptionD || row.D || "").trim();
      const correctAnswer = String(row.correct_answer || row.CorrectAnswer || row.answer || row.Answer || "").trim().toUpperCase();
      const explanation = String(row.explanation || row.Explanation || "").trim();

      if (!questionText) {
        errors.push({ row: i + 2, message: "Missing question text" });
        continue;
      }
      if (!optionA || !optionB || !optionC || !optionD) {
        errors.push({ row: i + 2, message: "Missing one or more options" });
        continue;
      }

      const correctMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
      if (!(correctAnswer in correctMap)) {
        errors.push({ row: i + 2, message: `Invalid correct answer: "${correctAnswer}". Must be A, B, C, or D` });
        continue;
      }

      questions.push({
        quiz_id: quizId,
        question_text: questionText.slice(0, 2000),
        options: [optionA.slice(0, 500), optionB.slice(0, 500), optionC.slice(0, 500), optionD.slice(0, 500)],
        correct_answer_index: correctMap[correctAnswer],
        explanation: explanation.slice(0, 2000),
        sort_order: i + 1,
      });
    }

    if (questions.length === 0 && errors.length > 0) {
      return errorResponse(`No valid questions found. First error: Row ${errors[0].row}: ${errors[0].message}`, 400);
    }

    // Verify quiz exists and is accessible
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("id", quizId)
      .single();

    if (quizError || !quiz) {
      return errorResponse("Quiz not found", 404);
    }

    const { data, error } = await supabase
      .from("questions")
      .insert(questions)
      .select();

    if (error) throw new Error("Failed to insert questions");

    const { count } = await supabase
      .from("questions")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quizId);

    await supabase
      .from("quizzes")
      .update({ question_count: count ?? 0 })
      .eq("id", quizId);

    return successResponse({
      imported: data?.length ?? 0,
      errors: errors.slice(0, 10), // Limit error output
      total_rows: rows.length,
    }, `${data?.length ?? 0} questions imported successfully`);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to import questions");
  }
}
