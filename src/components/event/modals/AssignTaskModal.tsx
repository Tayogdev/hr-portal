import React from "react";
import { Button } from "@/components/ui/button";
import { TaskDetails } from "@/types/event/eventDetail";

interface AssignTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApplicantName?: string;
  onAssignTask: (taskDetails: {
    title: string;
    description: string;
    dueDate: string;
  }) => void;
  editingTask: TaskDetails | null;
}

export function AssignTaskModal({
  isOpen,
  onClose,
  selectedApplicantName,
  onAssignTask,
  editingTask,
}: AssignTaskModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingTask ? "Edit Task" : "Assign New Task"} for{" "}
          {selectedApplicantName}
        </h2>
        <p>This is a placeholder for AssignTaskModal.</p>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button
            onClick={() =>
              onAssignTask({
                title: "Dummy Task",
                description: "This is a dummy task.",
                dueDate: "2025-12-31",
              })
            }
            disabled={!!editingTask}
          >
            {editingTask ? "Update Task" : "Assign Task"}
          </Button>
        </div>
      </div>
    </div>
  );
}
