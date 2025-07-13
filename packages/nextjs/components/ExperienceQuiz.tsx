"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { hybridExperienceService } from "~~/services/hybridExperienceService";

interface Task {
  id: number;
  name: string;
  description: string;
  taskType: string;
  data: string;
  answer: string;
  isCompleted: boolean;
}

interface Experience {
  id: number;
  name: string;
  isActive: boolean;
  tasks: Task[];
}

interface UserProgress {
  experienceStarted: boolean;
  experienceCompleted: boolean;
  completedTasks: number[];
}

interface ExperienceQuizProps {
  experience: Experience;
  onExperienceCompleted: () => void;
}

export const ExperienceQuiz = ({ experience, onExperienceCompleted }: ExperienceQuizProps) => {
  const { address: connectedAddress } = useAccount();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user progress on component mount
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!connectedAddress) {
        setLoading(false);
        return;
      }

      try {
        const progress = await hybridExperienceService.getUserProgress(connectedAddress, experience.id);
        setUserProgress(progress);

        // If experience not started, start it
        if (!progress?.experienceStarted) {
          await hybridExperienceService.startExperience(connectedAddress, experience.id);
          setUserProgress({
            experienceStarted: true,
            experienceCompleted: false,
            completedTasks: [],
          });
        }
      } catch (error) {
        console.error("Error loading user progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProgress();
  }, [connectedAddress, experience.id]);

  // Set initial task index to first incomplete task
  useEffect(() => {
    if (userProgress && experience.tasks.length > 0) {
      const firstIncompleteTaskIndex = experience.tasks.findIndex(
        (_, index) => !userProgress.completedTasks.includes(index),
      );
      setCurrentTaskIndex(firstIncompleteTaskIndex >= 0 ? firstIncompleteTaskIndex : 0);
    }
  }, [userProgress, experience.tasks]);

  const handleQuizSubmit = async () => {
    if (!connectedAddress || !quizAnswer.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await hybridExperienceService.completeQuizTask(
        connectedAddress,
        experience.id,
        experience.tasks[currentTaskIndex].id,
        quizAnswer.trim(),
      );

      if (success) {
        // Update local state
        const updatedProgress = await hybridExperienceService.getUserProgress(connectedAddress, experience.id);
        setUserProgress(updatedProgress);
        setQuizAnswer("");

        // Check if all tasks are completed
        if (updatedProgress?.experienceCompleted) {
          onExperienceCompleted();
        }
        // Don't automatically move to next task - let user choose
      } else {
        alert("Incorrect answer! Please try again.");
      }
    } catch (error) {
      console.error("Error completing quiz task:", error);
      alert("Error completing task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQRCodeTask = async () => {
    if (!connectedAddress) return;

    setIsSubmitting(true);
    try {
      const success = await hybridExperienceService.completeTask(
        connectedAddress,
        experience.id,
        experience.tasks[currentTaskIndex].id,
      );

      if (success) {
        const updatedProgress = await hybridExperienceService.getUserProgress(connectedAddress, experience.id);
        setUserProgress(updatedProgress);

        if (updatedProgress?.experienceCompleted) {
          onExperienceCompleted();
        }
        // Don't automatically move to next task - let user choose
      } else {
        alert("Task completion failed. Please try again.");
      }
    } catch (error) {
      console.error("Error completing QR code task:", error);
      alert("Error completing task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckInTask = async () => {
    if (!connectedAddress) return;

    setIsSubmitting(true);
    try {
      const success = await hybridExperienceService.completeTask(
        connectedAddress,
        experience.id,
        experience.tasks[currentTaskIndex].id,
      );

      if (success) {
        const updatedProgress = await hybridExperienceService.getUserProgress(connectedAddress, experience.id);
        setUserProgress(updatedProgress);

        if (updatedProgress?.experienceCompleted) {
          onExperienceCompleted();
        }
        // Don't automatically move to next task - let user choose
      } else {
        alert("Check-in failed. Please try again.");
      }
    } catch (error) {
      console.error("Error completing check-in task:", error);
      alert("Error completing task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!connectedAddress) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold mb-4">Connect Your Wallet</h3>
        <p className="text-base-content/70">Please connect your wallet to start the experience.</p>
      </div>
    );
  }

  if (userProgress?.experienceCompleted) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-4">Experience Completed!</h3>
        <p className="text-base-content/70 mb-6">Congratulations! You have completed all tasks in this experience.</p>
        <button onClick={onExperienceCompleted} className="btn btn-primary btn-lg">
          Claim Your NFT
        </button>
      </div>
    );
  }

  const completedTasksCount = userProgress?.completedTasks.length || 0;
  const totalTasks = experience.tasks.length;
  const progressPercentage = (completedTasksCount / totalTasks) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-base-content/70">
            {completedTasksCount} / {totalTasks} tasks completed
          </span>
        </div>
        <div className="w-full bg-base-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Task List with Accordion */}
      <div className="bg-base-100 rounded-lg p-6 shadow-lg">
        <h4 className="text-lg font-bold mb-4">All Tasks</h4>
        <div className="space-y-3">
          {experience.tasks.map((task, index) => {
            const isSelected = index === currentTaskIndex;
            const isCompleted = userProgress?.completedTasks.includes(index);

            return (
              <div key={task.id} className="border border-base-300 rounded-lg overflow-hidden">
                {/* Task Header */}
                <div
                  className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${
                    isCompleted
                      ? "bg-success/20 border-b border-success"
                      : isSelected
                        ? "bg-primary/20 border-b border-primary"
                        : "bg-base-200 border-b border-base-300"
                  }`}
                  onClick={() => setCurrentTaskIndex(index)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                >
                  <div className="flex-shrink-0 mr-3">
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${isSelected ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{task.name}</div>
                    <div className="text-sm text-base-content/70">{task.description}</div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    {isCompleted ? (
                      <div className="text-success">✅</div>
                    ) : isSelected ? (
                      <div className="text-primary">🔄</div>
                    ) : (
                      <div className="text-base-content/50">⭕</div>
                    )}
                  </div>
                </div>

                {/* Task Content (Accordion) */}
                {isSelected && (
                  <div className="p-4 bg-base-50 border-t border-base-200">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold mb-2">
                        Task {index + 1}: {task.name}
                      </h3>
                      <p className="text-base-content/70">{task.description}</p>
                    </div>

                    {/* Task Type Specific UI */}
                    {task.taskType === "QUIZ" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Your Answer:</label>
                          <input
                            type="text"
                            value={quizAnswer}
                            onChange={e => setQuizAnswer(e.target.value)}
                            placeholder="Enter your answer..."
                            className="input input-bordered w-full"
                            onKeyPress={e => e.key === "Enter" && handleQuizSubmit()}
                          />
                        </div>
                        <button
                          onClick={handleQuizSubmit}
                          disabled={isSubmitting || !quizAnswer.trim()}
                          className="btn btn-primary w-full"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="loading loading-spinner loading-sm"></div>
                              Submitting...
                            </>
                          ) : (
                            "Submit Answer"
                          )}
                        </button>
                      </div>
                    )}

                    {task.taskType === "QR_CODE" && (
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-base-200 rounded-lg">
                          <div className="text-4xl mb-2">📱</div>
                          <p className="text-sm text-base-content/70">
                            Scan the QR code at the location to complete this task
                          </p>
                        </div>
                        <button onClick={handleQRCodeTask} disabled={isSubmitting} className="btn btn-primary w-full">
                          {isSubmitting ? (
                            <>
                              <div className="loading loading-spinner loading-sm"></div>
                              Completing...
                            </>
                          ) : (
                            "Complete QR Code Task"
                          )}
                        </button>
                      </div>
                    )}

                    {task.taskType === "CHECK_IN" && (
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-base-200 rounded-lg">
                          <div className="text-4xl mb-2">📍</div>
                          <p className="text-sm text-base-content/70">
                            Check in at the specified location to complete this task
                          </p>
                        </div>
                        <button onClick={handleCheckInTask} disabled={isSubmitting} className="btn btn-primary w-full">
                          {isSubmitting ? (
                            <>
                              <div className="loading loading-spinner loading-sm"></div>
                              Checking in...
                            </>
                          ) : (
                            "Complete Check-in"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
