import React from "react";
import "whatwg-fetch";
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { server } from "../mocks/server";

import App from "../components/App";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("displays question prompts after fetching", async () => {
  render(<App />);

  fireEvent.click(screen.getByText(/View Questions/));

  // Wait for the questions to appear
  expect(await screen.findByText(/What special prop should always be included for lists of elements?/)).toBeInTheDocument();
  expect(await screen.findByText(/A React component is a function that returns ______./)).toBeInTheDocument();
});

test("creates a new question when the form is submitted", async () => {
  render(<App />);

  // Wait for the initial questions to load
  await screen.findByText(/What special prop should always be included for lists of elements?/);

  // Navigate to the form page
  fireEvent.click(screen.getByText("New Question"));

  // Fill out the form
  fireEvent.change(screen.getByLabelText(/Prompt/), {
    target: { value: "Test Prompt" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 1/), {
    target: { value: "Test Answer 1" },
  });
  fireEvent.change(screen.getByLabelText(/Answer 2/), {
    target: { value: "Test Answer 2" },
  });
  fireEvent.change(screen.getByLabelText(/Correct Answer/), {
    target: { value: "1" },
  });

  // Submit the form
  fireEvent.click(screen.getByText(/Add Question/));

  // Navigate back to the questions list
  fireEvent.click(screen.getByText(/View Questions/));

  // Verify the new question is displayed
  expect(await screen.findByText(/Test Prompt/)).toBeInTheDocument();
});

test("deletes the question when the delete button is clicked", async () => {
  render(<App />);

  fireEvent.click(screen.getByText(/View Questions/));

  // Wait for the initial questions to load
  await screen.findByText(/What special prop should always be included for lists of elements?/);

  // Click the delete button for the first question
  fireEvent.click(screen.getAllByText("Delete Question")[0]);

  // Wait for the question to be removed
  await waitForElementToBeRemoved(() =>
    screen.queryByText(/What special prop should always be included for lists of elements?/)
  );

  // Verify the question is no longer in the DOM
  expect(screen.queryByText(/What special prop should always be included for lists of elements?/)).not.toBeInTheDocument();
});

test("updates the answer when the dropdown is changed", async () => {
  const { rerender } = render(<App />);

  fireEvent.click(screen.getByText(/View Questions/));

  // Wait for the questions to load
  await screen.findByText(/What special prop should always be included for lists of elements?/);

  // Change the dropdown value
  fireEvent.change(screen.getAllByLabelText(/Correct Answer/)[0], {
    target: { value: "3" },
  });

  // Verify the dropdown value is updated
  expect(screen.getAllByLabelText(/Correct Answer/)[0].value).toBe("3");

  // Re-render the component
  rerender(<App />);

  // Verify the dropdown value persists
  expect(screen.getAllByLabelText(/Correct Answer/)[0].value).toBe("3");
});