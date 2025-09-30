import { Logout } from "@/components/auth/logout-button";

const Dashboard = () => {
  return (
    <div className="flex items-center justify-between p-10">
      Dashboard
      <Logout />
    </div>
  );
};

export default Dashboard;
