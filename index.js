import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 20;

// ── Colors ──
const color = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const c = (clr, text) => `${color[clr]}${text}${color.reset}`;
const bold = (text) => `${color.bold}${text}${color.reset}`;

// ── Load All Questions ──
function loadAllQuestions() {
  const questionsDir = path.join(__dirname, "questions");
  const files = fs
    .readdirSync(questionsDir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  const all = [];
  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(questionsDir, file), "utf-8")
    );
    all.push(...data);
  }
  return all;
}

// ── Readline Setup ──
function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// ── Shuffle ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Display Helpers ──
function clearScreen() {
  process.stdout.write("\x1b[2J\x1b[H");
}

function printBanner() {
  console.log("");
  console.log(
    c("cyan", "╔══════════════════════════════════════════════════════════════╗")
  );
  console.log(
    c("cyan", "║") +
      color.bold + color.yellow +
      "        🤖  AI LITERACY TUTOR  🤖                      " +
      color.reset + color.cyan + "║" + color.reset
  );
  console.log(
    c("cyan", "║") +
      color.dim +
      "       Your personal AI knowledge coach                  " +
      color.reset + color.cyan + "║" + color.reset
  );
  console.log(
    c("cyan", "║") +
      color.dim +
      `          300 Questions • Cycle ${BATCH_SIZE} at a time              ` +
      color.reset + color.cyan + "║" + color.reset
  );
  console.log(
    c("cyan", "╚══════════════════════════════════════════════════════════════╝")
  );
  console.log("");
}

function printDivider() {
  console.log(c("dim", "──────────────────────────────────────────────────────"));
}

function printQuestion(q, index, total) {
  console.log("");
  printDivider();
  console.log(`  ${c("cyan", bold(`Question ${index + 1}/${total}`))}`);
  printDivider();
  console.log("");
  console.log(`  ${bold(q.question)}`);
  console.log("");

  const choiceColors = { A: "yellow", B: "magenta", C: "blue", D: "green" };
  for (const [key, value] of Object.entries(q.choices)) {
    console.log(`    ${c(choiceColors[key], bold(key))}. ${value}`);
  }
  console.log("");
}

function printCorrect(q) {
  console.log(`  ${c("green", bold("✅ CORRECT!"))} Great job!`);
  console.log("");
  console.log(`  ${c("dim", "💡 Explanation:")} ${q.explanation}`);
  console.log("");
}

function printWrong(q, userAnswer) {
  console.log(
    `  ${c("red", bold("❌ INCORRECT!"))} You chose ${bold(userAnswer)}, but the correct answer is ${c("green", bold(q.answer))}.`
  );
  console.log("");
  console.log(`  ${c("dim", "💡 Explanation:")} ${q.explanation}`);
  console.log("");
}

function printScore(correct, total, round, totalRounds) {
  const pct = Math.round((correct / total) * 100);
  let grade, gradeColor;

  if (pct >= 90) {
    grade = "🏆 EXCELLENT!";
    gradeColor = "green";
  } else if (pct >= 70) {
    grade = "👍 GOOD JOB!";
    gradeColor = "yellow";
  } else if (pct >= 50) {
    grade = "📚 KEEP STUDYING!";
    gradeColor = "magenta";
  } else {
    grade = "💪 DON'T GIVE UP!";
    gradeColor = "red";
  }

  console.log("");
  console.log(
    c("cyan", "╔══════════════════════════════════════════════════════════════╗")
  );
  console.log(
    c("cyan", `║              ROUND ${round}/${totalRounds} — RESULTS                         ║`)
  );
  console.log(
    c("cyan", "╚══════════════════════════════════════════════════════════════╝")
  );
  console.log("");
  console.log(`  Score: ${bold(`${correct}/${total}`)} (${pct}%)`);
  console.log(`  ${c(gradeColor, bold(grade))}`);
  console.log("");

  const barLen = 30;
  const filled = Math.round((pct / 100) * barLen);
  const empty = barLen - filled;
  const bar = c("green", "█".repeat(filled)) + c("dim", "░".repeat(empty));
  console.log(`  Progress: [${bar}] ${pct}%`);
  console.log("");
}

function printOverallScore(totalCorrect, totalAnswered, roundsPlayed) {
  const pct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  console.log("");
  console.log(
    c("cyan", "╔══════════════════════════════════════════════════════════════╗")
  );
  console.log(
    c("cyan", "║                  OVERALL PROGRESS                            ║")
  );
  console.log(
    c("cyan", "╚══════════════════════════════════════════════════════════════╝")
  );
  console.log("");
  console.log(`  Rounds completed : ${bold(String(roundsPlayed))}`);
  console.log(`  Total score      : ${bold(`${totalCorrect}/${totalAnswered}`)} (${pct}%)`);

  const barLen = 30;
  const filled = Math.round((pct / 100) * barLen);
  const empty = barLen - filled;
  const bar = c("green", "█".repeat(filled)) + c("dim", "░".repeat(empty));
  console.log(`  Overall          : [${bar}] ${pct}%`);
  console.log("");
}

// ── Run a batch of 20 questions ──
async function runBatch(rl, questions, round, totalRounds) {
  let correct = 0;
  const wrongAnswers = [];

  clearScreen();
  console.log("");
  console.log(
    `  ${c("cyan", bold(`📝 Round ${round}/${totalRounds} — ${questions.length} Questions`))}`
  );
  console.log(`  ${c("dim", "Type A, B, C, or D to answer. Type 'q' to quit.")}`);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    printQuestion(q, i, questions.length);

    let answer = "";
    while (!["A", "B", "C", "D", "Q"].includes(answer)) {
      answer = (await ask(rl, `  ${c("cyan", "Your answer >")} `)).toUpperCase();
      if (!["A", "B", "C", "D", "Q"].includes(answer)) {
        console.log(c("red", "  Please enter A, B, C, or D."));
      }
    }

    if (answer === "Q") {
      console.log(c("yellow", "\n  Quiz aborted.\n"));
      return { correct, total: i, aborted: true };
    }

    if (answer === q.answer) {
      correct++;
      printCorrect(q);
    } else {
      wrongAnswers.push({ ...q, userAnswer: answer });
      printWrong(q, answer);
    }

    if (i < questions.length - 1) {
      await ask(rl, `  ${c("dim", "Press Enter to continue...")}`);
    }
  }

  printScore(correct, questions.length, round, totalRounds);

  // Review wrong answers
  if (wrongAnswers.length > 0) {
    const review = (
      await ask(
        rl,
        `  ${c("yellow", "Review incorrect answers? (y/n) >")} `
      )
    ).toLowerCase();

    if (review === "y" || review === "yes") {
      console.log("");
      console.log(c("yellow", bold("  📖 Review — Incorrect Answers:")));

      for (const q of wrongAnswers) {
        console.log("");
        printDivider();
        console.log(`  ${bold(q.question)}`);
        console.log(
          `  Your answer: ${c("red", bold(q.userAnswer))} | Correct: ${c("green", bold(q.answer))} — ${q.choices[q.answer]}`
        );
        console.log(`  ${c("dim", "💡")} ${q.explanation}`);
      }
      console.log("");
    }
  }

  return { correct, total: questions.length, aborted: false };
}

// ── Main ──
async function main() {
  const rl = createRL();
  const allQuestions = loadAllQuestions();
  const totalQuestions = allQuestions.length;
  const totalRounds = Math.ceil(totalQuestions / BATCH_SIZE);

  let running = true;

  while (running) {
    clearScreen();
    printBanner();

    console.log(`  ${bold("Total questions:")} ${totalQuestions}`);
    console.log(`  ${bold("Questions per round:")} ${BATCH_SIZE}`);
    console.log(`  ${bold("Total rounds:")} ${totalRounds}`);
    console.log("");
    console.log(`  ${bold("Choose a mode:")}`);
    console.log("");
    console.log(`    ${c("green", bold("1"))}. 🔄 Cycle Mode — Go through all ${totalQuestions} questions, ${BATCH_SIZE} at a time (in order)`);
    console.log(`    ${c("green", bold("2"))}. 🎲 Shuffle Mode — All ${totalQuestions} questions shuffled, ${BATCH_SIZE} at a time`);
    console.log(`    ${c("green", bold("3"))}. ⚡ Quick Random — Random ${BATCH_SIZE} questions`);
    console.log(`    ${c("green", bold("4"))}. 📖 Study Mode — Read questions & reveal answers (${BATCH_SIZE} at a time)`);
    console.log(`    ${c("red", bold("Q"))}. Quit`);
    console.log("");

    const choice = (await ask(rl, `  ${c("cyan", "Choose >")} `)).trim().toUpperCase();

    if (choice === "1") {
      // Cycle mode: sequential, 20 at a time, loops back
      let totalCorrect = 0;
      let totalAnswered = 0;
      let roundsPlayed = 0;

      for (let round = 0; round < totalRounds; round++) {
        const start = round * BATCH_SIZE;
        const batch = allQuestions.slice(start, start + BATCH_SIZE);

        const result = await runBatch(rl, batch, round + 1, totalRounds);
        totalCorrect += result.correct;
        totalAnswered += result.total;
        roundsPlayed++;

        if (result.aborted) break;

        printOverallScore(totalCorrect, totalAnswered, roundsPlayed);

        if (round < totalRounds - 1) {
          const next = (
            await ask(rl, `  ${c("cyan", "Continue to next round? (y/n) >")} `)
          ).toLowerCase();
          if (next !== "y" && next !== "yes" && next !== "") break;
        }
      }

      if (totalAnswered > 0 && totalAnswered >= totalQuestions) {
        console.log(c("green", bold("\n  🎉 Congratulations! You completed all 300 questions!\n")));
      }

      await ask(rl, `  ${c("dim", "Press Enter to return to menu...")}`);
      continue;
    }

    if (choice === "2") {
      // Shuffle mode: all questions shuffled, 20 at a time
      const shuffled = shuffle(allQuestions);
      let totalCorrect = 0;
      let totalAnswered = 0;
      let roundsPlayed = 0;

      for (let round = 0; round < totalRounds; round++) {
        const start = round * BATCH_SIZE;
        const batch = shuffled.slice(start, start + BATCH_SIZE);

        const result = await runBatch(rl, batch, round + 1, totalRounds);
        totalCorrect += result.correct;
        totalAnswered += result.total;
        roundsPlayed++;

        if (result.aborted) break;

        printOverallScore(totalCorrect, totalAnswered, roundsPlayed);

        if (round < totalRounds - 1) {
          const next = (
            await ask(rl, `  ${c("cyan", "Continue to next round? (y/n) >")} `)
          ).toLowerCase();
          if (next !== "y" && next !== "yes" && next !== "") break;
        }
      }

      if (totalAnswered > 0 && totalAnswered >= totalQuestions) {
        console.log(c("green", bold("\n  🎉 Congratulations! You completed all 300 questions!\n")));
      }

      await ask(rl, `  ${c("dim", "Press Enter to return to menu...")}`);
      continue;
    }

    if (choice === "3") {
      // Quick random: pick 20 random questions
      const batch = shuffle(allQuestions).slice(0, BATCH_SIZE);
      const result = await runBatch(rl, batch, 1, 1);
      if (!result.aborted) {
        await ask(rl, `  ${c("dim", "Press Enter to return to menu...")}`);
      }
      continue;
    }

    if (choice === "4") {
      // Study mode: cycle through in order, 20 at a time, flashcard style
      const shuffled = shuffle(allQuestions);
      let studyRound = 0;

      while (studyRound < totalRounds) {
        const start = studyRound * BATCH_SIZE;
        const batch = shuffled.slice(start, start + BATCH_SIZE);

        clearScreen();
        console.log("");
        console.log(
          `  ${c("cyan", bold(`📖 Study Mode — Round ${studyRound + 1}/${totalRounds}`))}`
        );
        console.log(`  ${c("dim", "Read each question, think, then press Enter to see the answer.")}`);
        console.log(`  ${c("dim", "Type 'q' to quit anytime.")}`);

        let quit = false;
        for (let i = 0; i < batch.length; i++) {
          const q = batch[i];
          printQuestion(q, i, batch.length);

          const input = await ask(
            rl,
            `  ${c("yellow", "Press Enter to reveal (or 'q' to quit) >")}\n`
          );
          if (input.toLowerCase() === "q") {
            quit = true;
            break;
          }

          console.log(
            `  ${c("green", bold("✅ Answer:"))} ${c("green", bold(q.answer))} — ${q.choices[q.answer]}`
          );
          console.log("");
          console.log(`  ${c("dim", "💡 Explanation:")} ${q.explanation}`);
          console.log("");

          if (i < batch.length - 1) {
            await ask(rl, `  ${c("dim", "Press Enter for next...")}`);
          }
        }

        if (quit) break;

        studyRound++;
        if (studyRound < totalRounds) {
          console.log(
            c("green", bold(`\n  ✅ Round ${studyRound}/${totalRounds} complete!\n`))
          );
          const next = (
            await ask(rl, `  ${c("cyan", "Continue to next round? (y/n) >")} `)
          ).toLowerCase();
          if (next !== "y" && next !== "yes" && next !== "") break;
        }
      }

      if (studyRound >= totalRounds) {
        console.log(c("green", bold("\n  🎉 You reviewed all 300 questions!\n")));
      }

      await ask(rl, `  ${c("dim", "Press Enter to return to menu...")}`);
      continue;
    }

    if (choice === "Q") {
      clearScreen();
      console.log("");
      console.log(
        c("cyan", bold("  👋 Thanks for studying! Keep learning about AI! Goodbye!"))
      );
      console.log("");
      running = false;
      continue;
    }

    console.log(c("red", "\n  Invalid choice. Please try again.\n"));
    await ask(rl, `  ${c("dim", "Press Enter to continue...")}`);
  }

  rl.close();
}

main().catch(console.error);
