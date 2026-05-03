/**
 * quiz.test.ts — Unit Tests for Quiz Logic & Data Integrity
 *
 * Validates the civic knowledge quiz: data integrity, scoring logic,
 * state machine transitions, boundary conditions, and content quality.
 */

import { describe, it, expect } from "vitest";

// ─── Quiz Data (mirrors src/pages/Quiz.tsx) ───────────────────────────────────
// We import the logic inline to avoid React/DOM dependency in Node test env.

const quizData = [
  {
    question: "When is Election Day in the US?",
    options: ["The first Monday in November", "November 1st", "First Tuesday after the first Monday in November", "The second Tuesday of November"],
    correctIndex: 2,
    explanation: "Since 1845, federal law has fixed Election Day as the first Tuesday after the first Monday in November.",
    link: "https://www.usa.gov/election-day",
    linkText: "USA.gov: Election Day Rules",
  },
  {
    question: "What is the minimum voting age in the US?",
    options: ["16 years old", "18 years old", "21 years old", "Graduation from high school"],
    correctIndex: 1,
    explanation: "The 26th Amendment, ratified in 1971, lowered the minimum voting age from 21 to 18.",
    link: "https://www.usa.gov/who-can-vote",
    linkText: "USA.gov: Voting Qualifications",
  },
  {
    question: "What is the Electoral College?",
    options: ["A university where you learn about politics", "A group of electors who formally elect the President", "The physical building where Congress meets", "The list of candidates on the ballot"],
    correctIndex: 1,
    explanation: "The Electoral College consists of 538 electors who officially cast the final ballots for President.",
    link: "https://www.usa.gov/electoral-college",
    linkText: "USA.gov: How the Electoral College Works",
  },
  {
    question: "What is a primary election?",
    options: ["The first election ever held in a state", "An election only for elementary school students", "An election to choose a party's candidate for the general election", "The final election of the year"],
    correctIndex: 2,
    explanation: "Primaries and caucuses are preliminary elections where voters choose which candidate will represent a specific party.",
    link: "https://www.usa.gov/primaries-caucuses",
    linkText: "USA.gov: Primaries vs Caucuses",
  },
  {
    question: "How many senators does each US state have?",
    options: ["Based on population", "1", "2", "4"],
    correctIndex: 2,
    explanation: "The Constitution mandates exactly 2 senators per state for equal representation.",
    link: "https://www.senate.gov/senators/index.htm",
    linkText: "Senate.gov: About the U.S. Senate",
  },
  {
    question: "What is an absentee ballot?",
    options: ["A ballot that is ignored by officials", "A ballot cast by a candidate who is absent", "A ballot cast by mail or early when a voter can't get to the polls", "A ballot used only in local elections"],
    correctIndex: 2,
    explanation: "Absentee or 'mail-in' voting allows registered voters to cast their ballot without going to a polling place.",
    link: "https://www.usa.gov/absentee-voting",
    linkText: "USA.gov: Guide to Absentee Voting",
  },
  {
    question: "Which amendment guarantees the right to vote regardless of race?",
    options: ["1st Amendment", "15th Amendment", "19th Amendment", "2th Amendment"],
    correctIndex: 1,
    explanation: "The 15th Amendment (1870) prohibits denying the right to vote based on 'race, color, or previous condition of servitude.'",
    link: "https://www.archives.gov/founding-docs/amendment-15",
    linkText: "Archives.gov: The 15th Amendment",
  },
  {
    question: "How long is a US Presidential term?",
    options: ["2 years", "4 years", "6 years", "8 years"],
    correctIndex: 1,
    explanation: "The President serving a 4-year term was established in Article II of the Constitution.",
    link: "https://www.usa.gov/presidents",
    linkText: "USA.gov: Presidential Terms & Limits",
  },
  {
    question: "What is the minimum voting age in India?",
    options: ["16 years old", "18 years old", "21 years old", "25 years old"],
    correctIndex: 1,
    explanation: "The voting age in India was lowered from 21 to 18 years in 1989 by the 61st Constitutional Amendment Act.",
    link: "https://voters.eci.gov.in/",
    linkText: "ECI: Voter Eligibility",
  },
  {
    question: "What does EVM stand for in Indian elections?",
    options: ["Electric Voter Meter", "Electronic Voting Machine", "Election Verification Module", "Every Vote Matters"],
    correctIndex: 1,
    explanation: "EVM stands for Electronic Voting Machine, used in all constituencies since the 2004 General Elections.",
    link: "https://www.eci.gov.in/evm/",
    linkText: "ECI: About EVMs",
  },
  {
    question: "Which constitutional body conducts elections in India?",
    options: ["Supreme Court of India", "The Parliament", "Election Commission of India", "Ministry of Home Affairs"],
    correctIndex: 2,
    explanation: "The Election Commission of India (ECI) is an autonomous constitutional authority for administering elections.",
    link: "https://www.eci.gov.in/",
    linkText: "ECI Official Website",
  },
];

// ─── Quiz State Machine (pure logic, mirrors React component) ─────────────────

interface QuizState {
  currentQ: number;
  selectedAnswer: number | null;
  score: number;
  isComplete: boolean;
}

function initialQuizState(): QuizState {
  return { currentQ: 0, selectedAnswer: null, score: 0, isComplete: false };
}

function selectAnswer(state: QuizState, index: number): QuizState {
  if (state.selectedAnswer !== null) return state; // prevent re-selection
  const correct = index === quizData[state.currentQ].correctIndex;
  return {
    ...state,
    selectedAnswer: index,
    score: correct ? state.score + 1 : state.score,
  };
}

function nextQuestion(state: QuizState): QuizState {
  if (state.currentQ < quizData.length - 1) {
    return { ...state, currentQ: state.currentQ + 1, selectedAnswer: null };
  }
  return { ...state, isComplete: true };
}

function resetQuiz(): QuizState {
  return initialQuizState();
}

function getScoreMessage(score: number, total: number): string {
  const pct = (score / total) * 100;
  if (pct === 100) return "Perfect Score!";
  if (pct >= 70) return "Impressive work!";
  return "A good start!";
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("Quiz Data Integrity", () => {
  it("should have at least 10 quiz questions", () => {
    expect(quizData.length).toBeGreaterThanOrEqual(10);
  });

  it("should have no duplicate questions", () => {
    const questions = quizData.map((q) => q.question);
    const unique = new Set(questions);
    expect(unique.size).toBe(questions.length);
  });

  it("every question should have exactly 4 options", () => {
    quizData.forEach((q) => {
      expect(q.options.length).toBe(4);
    });
  });

  it("every question's correctIndex should be within valid range (0–3)", () => {
    quizData.forEach((q) => {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThanOrEqual(3);
    });
  });

  it("every question should have a non-empty explanation", () => {
    quizData.forEach((q) => {
      expect(q.explanation.trim().length).toBeGreaterThan(20);
    });
  });

  it("every question should have a valid external link URL", () => {
    quizData.forEach((q) => {
      expect(q.link).toMatch(/^https?:\/\/.+/);
    });
  });

  it("every question should have a non-empty question text", () => {
    quizData.forEach((q) => {
      expect(q.question.trim().length).toBeGreaterThan(5);
    });
  });

  it("no option within a question should be duplicated", () => {
    quizData.forEach((q) => {
      const unique = new Set(q.options);
      expect(unique.size).toBe(q.options.length);
    });
  });

  it("should include both US and India questions", () => {
    const hasUSQuestion = quizData.some(
      (q) => q.link.includes("usa.gov") || q.link.includes("senate.gov") || q.link.includes("archives.gov")
    );
    const hasIndiaQuestion = quizData.some(
      (q) => q.link.includes("eci.gov.in") || q.link.includes("voters.eci.gov.in")
    );
    expect(hasUSQuestion).toBe(true);
    expect(hasIndiaQuestion).toBe(true);
  });
});

describe("Quiz State Machine — Answer Selection", () => {
  it("should start with score 0, question 0, and no selection", () => {
    const state = initialQuizState();
    expect(state.score).toBe(0);
    expect(state.currentQ).toBe(0);
    expect(state.selectedAnswer).toBeNull();
    expect(state.isComplete).toBe(false);
  });

  it("should increment score when correct answer is selected", () => {
    let state = initialQuizState();
    const correctIdx = quizData[0].correctIndex;
    state = selectAnswer(state, correctIdx);
    expect(state.score).toBe(1);
    expect(state.selectedAnswer).toBe(correctIdx);
  });

  it("should NOT increment score when wrong answer is selected", () => {
    let state = initialQuizState();
    const wrongIdx = (quizData[0].correctIndex + 1) % 4;
    state = selectAnswer(state, wrongIdx);
    expect(state.score).toBe(0);
    expect(state.selectedAnswer).toBe(wrongIdx);
  });

  it("should prevent re-selection after answer is chosen (immutability)", () => {
    let state = initialQuizState();
    const wrongIdx = (quizData[0].correctIndex + 1) % 4;
    state = selectAnswer(state, wrongIdx);
    const firstSelection = state.selectedAnswer;
    // Try to select again — should be ignored
    state = selectAnswer(state, quizData[0].correctIndex);
    expect(state.selectedAnswer).toBe(firstSelection);
    expect(state.score).toBe(0); // Score should not change
  });
});

describe("Quiz State Machine — Navigation", () => {
  it("should advance to the next question", () => {
    let state = initialQuizState();
    state = selectAnswer(state, 0);
    state = nextQuestion(state);
    expect(state.currentQ).toBe(1);
    expect(state.selectedAnswer).toBeNull();
  });

  it("should mark quiz as complete after the last question", () => {
    let state = initialQuizState();
    // Fast-forward to last question
    for (let i = 0; i < quizData.length - 1; i++) {
      state = selectAnswer(state, quizData[i].correctIndex);
      state = nextQuestion(state);
    }
    // Answer last question and advance
    state = selectAnswer(state, quizData[quizData.length - 1].correctIndex);
    state = nextQuestion(state);
    expect(state.isComplete).toBe(true);
  });

  it("should reset all state on resetQuiz()", () => {
    let state = initialQuizState();
    state = selectAnswer(state, 0);
    state = nextQuestion(state);
    state = resetQuiz();
    expect(state.currentQ).toBe(0);
    expect(state.score).toBe(0);
    expect(state.selectedAnswer).toBeNull();
    expect(state.isComplete).toBe(false);
  });

  it("should not go beyond last question without completing", () => {
    // nextQuestion at last question should set isComplete, not increment currentQ beyond bounds
    let state = { currentQ: quizData.length - 1, selectedAnswer: 0, score: 5, isComplete: false };
    state = nextQuestion(state);
    expect(state.isComplete).toBe(true);
    expect(state.currentQ).toBeLessThanOrEqual(quizData.length - 1);
  });
});

describe("Quiz Scoring & Result Messages", () => {
  it("should show 'Perfect Score!' for 100% accuracy", () => {
    expect(getScoreMessage(quizData.length, quizData.length)).toBe("Perfect Score!");
  });

  it("should show 'Impressive work!' for ≥70% accuracy", () => {
    const score70 = Math.ceil(quizData.length * 0.7);
    expect(getScoreMessage(score70, quizData.length)).toBe("Impressive work!");
  });

  it("should show 'A good start!' for <70% accuracy", () => {
    expect(getScoreMessage(0, quizData.length)).toBe("A good start!");
  });

  it("should calculate correct percentages for edge scores", () => {
    // Score of 1 on 11 questions = ~9% → A good start
    expect(getScoreMessage(1, 11)).toBe("A good start!");
    // Score of 11 on 11 = 100% → Perfect
    expect(getScoreMessage(11, 11)).toBe("Perfect Score!");
  });
});
