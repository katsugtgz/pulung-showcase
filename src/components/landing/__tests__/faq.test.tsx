import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Faq } from "../faq";
import { getFaq, getSectionHeader } from "@/lib/copy";

afterEach(cleanup);

describe("Faq accordion", () => {
  it("renders the PAS section header from the copy module", () => {
    render(<Faq />);
    expect(
      screen.getByRole("heading", { name: getSectionHeader("faq") }),
    ).toBeInTheDocument();
  });

  it("renders every FAQ question from the copy module as a button", () => {
    render(<Faq />);
    const entries = getFaq();
    expect(entries.length).toBeGreaterThanOrEqual(6);
    for (const entry of entries) {
      expect(
        screen.getByRole("button", { name: entry.question }),
      ).toBeInTheDocument();
    }
  });

  it("starts with every panel collapsed", () => {
    render(<Faq />);
    for (const entry of getFaq()) {
      const button = screen.getByRole("button", { name: entry.question });
      expect(button).toHaveAttribute("aria-expanded", "false");
    }
  });

  it("expands a question on click and reveals its answer", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const [first] = getFaq();
    const firstButton = screen.getByRole("button", { name: first.question });

    await user.click(firstButton);

    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(first.answer)).toBeVisible();
  });

  it("keeps only one panel open at a time (single-open)", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const [first, second] = getFaq();
    const firstButton = screen.getByRole("button", { name: first.question });
    const secondButton = screen.getByRole("button", {
      name: second.question,
    });

    await user.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");

    await user.click(secondButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(secondButton).toHaveAttribute("aria-expanded", "true");
  });

  it("renders exactly the copy-module question set — no hardcoded strings", () => {
    render(<Faq />);
    const renderedQuestions = screen
      .getAllByRole("button")
      .map((b) => b.textContent ?? "");
    const copyQuestions = getFaq().map((f) => f.question);
    expect(renderedQuestions.sort()).toEqual([...copyQuestions].sort());
  });
});
