import { Sidebar } from "../../components/SideBar";

const items = [
    {
        href: "/dashboard",
        title: "Dashboard",
      },
    {
      href: "/dashboard/overview",
      title: "Overview",
    },
    {
      href: "/dashboard/profile",
      title: "Profile",
    },
    {
      href: "/dashboard/subscriptions",
      title: "Subscriptions",
    },
    {
      href: "/dashboard/likes",
      title: "Likes",
    },
    {
      href: "/dashboard/comments",
      title: "Comments",
    },
  ];

export default function DashboardLayout({
  children, // will be a page or nested layout
}) {
    return (
        <div id="home" className="max-w-7xl xl:border mx-auto flex mt-5 h-[100vh]">
          <Sidebar items={items} />
          {children}
        </div>
      );
    }

