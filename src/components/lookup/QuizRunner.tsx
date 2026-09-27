import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Loader2, RotateCcw } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useToast } from "../ui/Toast";
import { ResultBlocks } from "./ResultBlocks";
import type { LookupResultPayload } from "../../../shared/lookup-types";
import type { QuizPublicSet } from "../../../shared/quiz/types";
import { Button } from "../ui/Button";

const PAGE_SIZE = 5;

type QuizRunnerProps = {
  quizKey: "disc" | "mbti";
  title: string;
  description: string;
};

type DiscAnswer = { most?: string; least?: string };

type QuizReportResponse = { report: LookupResultPayload & { id: string } };

function toPayload(report: LookupResultPayload): LookupResultPayload {
  return {
    headline: report.headline,
    subhead: report.subhead,
    blocks: report.blocks ?? [],
    disclaimer: report.disclaimer,
  };
}

/**
 * Khung làm bài dùng chung cho DISC và MBTI: tải đề từ CMS qua API (không fallback cứng),
 * phân trang 5 câu mỗi bước, chấm điểm ở server và hiển thị kết quả bằng `ResultBlocks`.
 */
export function QuizRunner({ quizKey, title, description }: QuizRunnerProps) {
  const toast = useToast();
  const [quiz, setQuiz] = useState<QuizPublicSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [discAnswers, setDiscAnswers] = useState<Record<string, DiscAnswer>>({});
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<LookupResultPayload | null>(null);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await api.get<{ quiz: QuizPublicSet }>(`/api/quiz/${quizKey}`);
      setQuiz(data.quiz);
      setPageIndex(0);
      setDiscAnswers({});
      setMbtiAnswers({});
      setResult(null);
      setSubmitError("");
    } catch (caught) {
      setQuiz(null);
      setLoadError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [quizKey]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const items = quiz?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(pageIndex, totalPages - 1);
  const pageItems = useMemo(
    () => items.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [items, currentPage],
  );

  const isAnswered = useCallback(
    (itemId: string) =>
      quizKey === "disc"
        ? Boolean(discAnswers[itemId]?.most && discAnswers[itemId]?.least)
        : Boolean(mbtiAnswers[itemId]),
    [quizKey, discAnswers, mbtiAnswers],
  );

  const answeredCount = items.filter((item) => isAnswered(item.id)).length;

  const setDiscAnswer = (itemId: string, field: "most" | "least", value: string) => {
    setDiscAnswers((prev) => {
      const current = prev[itemId] ?? {};
      const next: DiscAnswer = { ...current, [field]: value || undefined };
      if (next.most && next.least && next.most === next.least) {
        if (field === "most") next.least = undefined;
        else next.most = undefined;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const goNext = () => {
    const missing = pageItems.filter((item) => !isAnswered(item.id));
    if (missing.length) {
      toast.error("Bạn còn câu chưa trả lời", `Còn ${missing.length} câu ở bước này cần hoàn thành trước khi sang bước tiếp theo.`);
      return;
    }
    setPageIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const submit = async () => {
    const missing = items.filter((item) => !isAnswered(item.id));
    if (missing.length) {
      const firstMissing = items.findIndex((item) => !isAnswered(item.id));
      setPageIndex(Math.max(0, Math.floor(firstMissing / PAGE_SIZE)));
      toast.error("Chưa trả lời hết", `Còn ${missing.length} câu chưa hoàn thành. Vui lòng bổ sung trước khi xem kết quả.`);
      return;
    }

    const answers: Record<string, string> = {};
    if (quizKey === "disc") {
      for (const item of items) {
        const answer = discAnswers[item.id];
        if (answer?.most) answers[`${item.id}.most`] = answer.most;
        if (answer?.least) answers[`${item.id}.least`] = answer.least;
      }
    } else {
      for (const item of items) {
        const answer = mbtiAnswers[item.id];
        if (answer) answers[item.id] = answer;
      }
    }

    setSubmitting(true);
    setSubmitError("");
    try {
      const data = await api.post<QuizReportResponse>(`/api/quiz/${quizKey}/score`, {
        inputs: { answers },
        source: quizKey === "disc" ? "/tra-cuu/disc" : "/tra-cuu/mbti",
      });
      setResult(toPayload(data.report));
      toast.success("Đã chấm xong kết quả", "Kết quả mang tính tham chiếu khung, không dùng để chẩn đoán tâm lý.");
    } catch (caught) {
      const message = errorMessage(caught);
      setSubmitError(message);
      toast.error("Không chấm được kết quả", message);
    } finally {
      setSubmitting(false);
    }
  };

  const restart = () => {
    setDiscAnswers({});
    setMbtiAnswers({});
    setResult(null);
    setSubmitError("");
    setPageIndex(0);
  };

  if (loading) {
    return (
      <div className="result-preview section--dark">
        <div className="result-preview__empty">
          <Loader2 className="spin" aria-hidden="true" />
          <h2>Đang tải đề trắc nghiệm</h2>
          <p>Hệ thống đang lấy bộ câu hỏi mới nhất từ kho nội dung. Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (loadError || !quiz) {
    return (
      <div className="result-preview section--dark">
        <div className="result-preview__empty">
          <AlertTriangle aria-hidden="true" />
          <h2>Chưa tải được đề trắc nghiệm</h2>
          <p>{loadError || "Bộ câu hỏi chưa sẵn sàng."}</p>
          <p>Đề được quản lý trong cơ sở dữ liệu nên cần được nhập (seed) hoặc xuất bản trước khi làm bài.</p>
          <Button variant="primary" onClick={() => void loadQuiz()}>
            <RotateCcw aria-hidden="true" /> Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <ResultBlocks payload={result} />
        {submitError ? (
          <div className="privacy-banner" role="alert">
            <AlertTriangle aria-hidden="true" />
            <div>
              <strong>Lưu ý</strong>
              <span>{submitError}</span>
            </div>
          </div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
          <Button variant="secondary" onClick={restart}>
            <RotateCcw aria-hidden="true" /> Làm lại
          </Button>
        </div>
      </div>
    );
  }

  const progressPercent = items.length ? Math.round((answeredCount / items.length) * 100) : 0;
  const firstQuestionNumber = currentPage * PAGE_SIZE + 1;
  const lastQuestionNumber = firstQuestionNumber + Math.max(0, pageItems.length - 1);

  return (
    <div className="page-form-card quiz-runner">
      <div className="quiz-intro">
        <small>Trắc nghiệm {quizKey === "disc" ? "DISC" : "MBTI"}</small>
        <h2>{quiz.title || title}</h2>
        <p>{quiz.instructions || description}</p>
      </div>

      <div className="quiz-progress">
        <p className="quiz-progress__meta">
          <span>
            Câu {firstQuestionNumber}–{lastQuestionNumber}/{items.length}
          </span>
          <span>{progressPercent}%</span>
        </p>
        <div
          className="quiz-progress__track"
          role="progressbar"
          aria-label="Tiến độ trả lời"
          aria-valuenow={answeredCount}
          aria-valuemin={0}
          aria-valuemax={items.length}
        >
          <i style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="quiz-questions">
        {pageItems.map((item) => (
          <div className="quiz-question" key={item.id}>
            <p className="quiz-question__text" id={`${item.id}-label`}>
              Câu {item.order}. {item.text}
            </p>
            {quizKey === "disc" ? (
              <div className="quiz-groups">
                {(["most", "least"] as const).map((field) => (
                  <div className="quiz-group" key={field}>
                    <p className="quiz-group__label" id={`${item.id}-${field}`}>
                      {field === "most" ? "Giống bạn nhất" : "Ít giống bạn nhất"}
                    </p>
                    <div className="quiz-choices" role="radiogroup" aria-labelledby={`${item.id}-${field}`}>
                      {item.options.map((option) => (
                        <label className={`quiz-choice${discAnswers[item.id]?.[field] === option.id ? " is-selected" : ""}`} key={`${field}-${option.id}`}>
                          <input
                            type="radio"
                            name={`${item.id}-${field}`}
                            value={option.id}
                            checked={discAnswers[item.id]?.[field] === option.id}
                            onChange={() => setDiscAnswer(item.id, field, option.id)}
                          />
                          <span className="quiz-choice__text">{option.label}</span>
                          <Check className="quiz-choice__mark" aria-hidden="true" />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="quiz-choices" role="radiogroup" aria-labelledby={`${item.id}-label`}>
                {item.options.map((option) => (
                  <label className={`quiz-choice${mbtiAnswers[item.id] === option.id ? " is-selected" : ""}`} key={option.id}>
                    <input
                      type="radio"
                      name={item.id}
                      value={option.id}
                      checked={mbtiAnswers[item.id] === option.id}
                      onChange={() => setMbtiAnswers((prev) => ({ ...prev, [item.id]: option.id }))}
                    />
                    <span className="quiz-choice__text">{option.label}</span>
                    <Check className="quiz-choice__mark" aria-hidden="true" />
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="quiz-actions">
        <Button
          type="button"
          variant="secondary"
          disabled={currentPage === 0}
          onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
        >
          Bước trước
        </Button>
        {currentPage < totalPages - 1 ? (
          <Button variant="primary" onClick={goNext}>
            Tiếp tục
          </Button>
        ) : (
          <Button variant="primary" disabled={submitting} onClick={() => void submit()}>
            {submitting ? "Đang chấm điểm…" : "Xem kết quả"}
          </Button>
        )}
      </div>

      {submitError ? (
        <div className="privacy-banner" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div>
            <strong>Không chấm được kết quả</strong>
            <span>{submitError}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
