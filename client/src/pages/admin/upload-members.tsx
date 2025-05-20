import { Helmet } from "react-helmet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import MemberUpload from "@/components/admin/MemberUpload";

const UploadMembersPage = () => {
  return (
    <>
      <Helmet>
        <title>Upload Members - Admin - Croydon Business Association</title>
        <meta name="description" content="Administrative tool for bulk uploading members to the Croydon Business Association directory." />
      </Helmet>
      
      <DashboardLayout>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Member Upload</h1>
          <p className="text-neutral-600 mb-6">
            Upload a CSV file to add or update multiple member businesses at once.
          </p>
          
          <MemberUpload />
        </div>
      </DashboardLayout>
    </>
  );
};

export default UploadMembersPage;
