import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const quizId = formData.get("quiz_id") as string | null;

    if (!file) return errorResponse("No file provided", 400);
    if (!quizId) return errorResponse("quiz_id is required", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rows.length === 0) return errorResponse("File is empty", 400);

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
      return errorResponse(`No valid questions found. Errors: ${errors.map((e) => `Row ${e.row}: ${e.message}`).join("; ")}`, 400);
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
      errors,
      total_rows: rows.length,
    }, `${data?.length ?? 0} questions imported successfully`);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }
    return errorResponse("Failed to import questions");
  }
}
