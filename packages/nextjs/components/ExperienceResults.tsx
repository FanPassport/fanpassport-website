import React from "react";

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
  completionDate?: number;
}

interface ExperienceResultsProps {
  experience: Experience;
  userProgress: UserProgress | null;
  onBackToExperience: () => void;
  onClaimNFT?: () => void;
  claiming?: boolean;
  connectedAddress?: string | null;
}

export const ExperienceResults: React.FC<ExperienceResultsProps> = ({
  experience,
  userProgress,
  onBackToExperience,
  onClaimNFT,
  claiming = false,
  connectedAddress,
}) => {
  if (!userProgress?.experienceCompleted) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold mb-4">Experience Not Completed</h3>
        <p className="text-base-content/70 mb-6">Complete all tasks to view your results.</p>
        <button onClick={onBackToExperience} className="btn btn-primary">
          Back to Experience
        </button>
      </div>
    );
  }

  const completedTasksCount = userProgress.completedTasks.length;
  const totalTasks = experience.tasks.length;
  const completionDate = userProgress.completionDate
    ? new Date(userProgress.completionDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-4">Experience Results</h2>
        <p className="text-lg text-base-content/70 mb-4">Congratulations on completing {experience.name}!</p>
        <div className="stats stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Tasks Completed</div>
            <div className="stat-value text-success">
              {completedTasksCount}/{totalTasks}
            </div>
            <div className="stat-desc">100% Success Rate</div>
          </div>
          <div className="stat">
            <div className="stat-title">Completion Date</div>
            <div className="stat-value text-primary">{completionDate}</div>
            <div className="stat-desc">Achievement Unlocked</div>
          </div>
        </div>
      </div>

      {/* Task Results */}
      <div className="bg-base-100 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-6">Task Breakdown</h3>
        <div className="space-y-4">
          {experience.tasks.map((task, index) => {
            const isCompleted = userProgress.completedTasks.includes(index);
            const taskNumber = index + 1;

            return (
              <div
                key={task.id}
                className={`border rounded-lg p-4 transition-all duration-200 ${
                  isCompleted ? "border-success bg-success/10" : "border-error bg-error/10"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-base-content/70 mr-2">Task {taskNumber}</span>
                      {isCompleted ? (
                        <span className="badge badge-success">Completed</span>
                      ) : (
                        <span className="badge badge-error">Incomplete</span>
                      )}
                    </div>
                    <h4 className="font-bold text-lg mb-2">{task.name}</h4>
                    <p className="text-base-content/70 mb-3">{task.description}</p>

                    {/* Task Type Specific Information */}
                    <div className="space-y-2">
                      {task.taskType === "QUIZ" && (
                        <div className="bg-base-200 rounded p-3">
                          <div className="text-sm font-medium mb-1">Quiz Question:</div>
                          <div className="text-base-content/70 mb-2">{task.data}</div>
                          <div className="text-sm font-medium mb-1">Correct Answer:</div>
                          <div className="text-success font-medium">{task.answer}</div>
                        </div>
                      )}

                      {task.taskType === "QR_CODE" && (
                        <div className="bg-base-200 rounded p-3">
                          <div className="text-sm font-medium mb-1">QR Code Location:</div>
                          <div className="text-base-content/70 mb-2">{task.description}</div>
                          <div className="text-sm font-medium mb-1">Expected Code:</div>
                          <div className="text-success font-medium">{task.answer}</div>
                        </div>
                      )}

                      {task.taskType === "CHECK_IN" && (
                        <div className="bg-base-200 rounded p-3">
                          <div className="text-sm font-medium mb-1">Check-in Location:</div>
                          <div className="text-base-content/70">{task.description}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    {isCompleted ? (
                      <div className="text-success text-2xl">✅</div>
                    ) : (
                      <div className="text-error text-2xl">❌</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Summary */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Achievement Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-base-100 rounded p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-bold mb-2">Perfect Completion</h4>
            <p className="text-sm text-base-content/70">
              You successfully completed all {totalTasks} tasks with 100% accuracy.
            </p>
          </div>
          <div className="bg-base-100 rounded p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-bold mb-2">Experience Mastered</h4>
            <p className="text-sm text-base-content/70">
              You&apos;ve demonstrated full understanding of the {experience.name} experience.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button onClick={onBackToExperience} className="btn btn-outline btn-lg">
          ← Back to Experience
        </button>
        {onClaimNFT && (
          <button onClick={onClaimNFT} disabled={claiming || !connectedAddress} className="btn btn-primary btn-lg">
            {claiming ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
                Claiming NFT...
              </>
            ) : !connectedAddress ? (
              "🔗 Connect Wallet"
            ) : (
              "🎁 Claim NFT Reward"
            )}
          </button>
        )}
      </div>
    </div>
  );
};
