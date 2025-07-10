import ShortlistedEmailPreview from "../../../../../components/previewmodule/ShortlistedEmailPreview";
import HiredEmail from "../../../../../components/previewmodule/HiredEmail";
import RejectedEmail from "../../../../../components/previewmodule/RejectedEmail";
import TaskAssignEmailPreview from "@/components/previewmodule/TaskAssignedEmail";
import InterviewScheduledEmailPreview from "@/components/previewmodule/InterviewScheduledEmail";
interface Props {
  params: {
    emailType: string;
  };
}

const PreviewPage = ({ params }: Props) => {
  const { emailType } = params;

  switch (emailType) {
    case "shortlisted":
      return <ShortlistedEmailPreview />;
    case "hired":
      return <HiredEmail />;
    case "rejected":
      return <RejectedEmail />;
       case "task-assigned":
      return <TaskAssignEmailPreview />;
        case "interview-scheduled":
      return <InterviewScheduledEmailPreview />;

    default:
      return (
        <div className="min-h-screen flex items-center justify-center text-red-500">
          Invalid email preview type.
        </div>
      );
  }
};

export default PreviewPage;
