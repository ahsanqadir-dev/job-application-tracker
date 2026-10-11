"use client";
import { useEffect, useState } from "react";
interface Application {
  id: number;
  company_name: string;
  position: string;
  status: string;
  application_date: string;
  notes: string | null;
}
export default function Home() {
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    interview: 0,
    selected: 0,
    rejected: 0,
  });
 const [applications, setApplications] = useState<Application[]>([]);
 const [showModal, setShowModal] = useState(false);
 const [editModal, setEditModal] = useState(false);
const [editId, setEditId] = useState<number | null>(null);

const [companyName, setCompanyName] = useState("");
const [position, setPosition] = useState("");
const [status, setStatus] = useState("Applied");
const [notes, setNotes] = useState("");
const [search, setSearch] = useState("");
const [filterStatus, setFilterStatus] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [userName, setUserName] = useState("");
const [sidebarOpen, setSidebarOpen] = useState(false);
  const fetchData = async () => {
  setLoading(true);
  setError("");

  try {
    const token = localStorage.getItem("token");

    const statsResponse = await fetch(
      "http://localhost:5000/api/applications/stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const statsData = await statsResponse.json();

    setStats(statsData);

    const applicationsResponse = await fetch(
      `http://localhost:5000/api/applications?search=${debouncedSearch}&status=${filterStatus}&page=${page}&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const applicationsData = await applicationsResponse.json();

    setApplications(applicationsData.data);
    setTotalPages(applicationsData.totalPages);

  } catch (error) {
    console.error(error);
    setError("Failed to fetch applications");

  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  fetchProfile();
}, []);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [search]);
useEffect(() => {
  fetchData();
}, [debouncedSearch, filterStatus, page]);
const handleAddApplication = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:5000/api/applications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        company_name: companyName,
        position: position,
        status: status,
        notes: notes,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message);
    return;
  }

  alert("Application added successfully");

await fetchData();

setShowModal(false);

setCompanyName("");
setPosition("");
setStatus("Applied");
setNotes("");
};
const handleEditClick = (application: Application) => {
  setEditId(application.id);

  setCompanyName(application.company_name);
  setPosition(application.position);
  setStatus(application.status);
  setNotes(application.notes || "");

  setEditModal(true);
};
const handleDeleteApplication = async (id: number) => {
  const confirmed = confirm(
    "Are you sure you want to delete this application?"
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:5000/api/applications/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message);
    return;
  }
  if (applications.length === 1 && page > 1) {
  setPage(page - 1);
  return;
}
  await fetchData();
};
const handleUpdateApplication = async () => {
  if (editId === null) {
    return;
  }

  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://localhost:5000/api/applications/${editId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        company_name: companyName,
        position: position,
        status: status,
        notes: notes,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(data.message);
    return;
  }

  await fetchData();

  setEditModal(false);
  setEditId(null);

  setCompanyName("");
  setPosition("");
  setStatus("Applied");
  setNotes("");
};
const handleStatusChange = async (
  id: number,
  newStatus: string
) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5000/api/applications/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    await fetchData();

  } catch (error) {
    console.error(error);
    alert("Failed to update status");
  }
};
const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
const fetchProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  const response = await fetch(
    "http://localhost:5000/api/auth/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  setUserName(data.user.name);
};
  return (
    <div className="min-h-screen bg-gray-100 flex">
      
{/* Mobile Sidebar Backdrop */}
{sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
  />
)}

      {/* Sidebar */}
      <aside
  className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white p-6 transform transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <button
  onClick={() => setSidebarOpen(false)}
  className="lg:hidden absolute top-4 right-4 text-white text-xl"
>
  ✕
</button>
        <h1 className="text-2xl font-bold mb-10">Job Tracker</h1>

        <nav className="space-y-4">
          
<button
  onClick={() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSidebarOpen(false);
  }}
  className="w-full text-left bg-gray-700 p-3 rounded-lg cursor-pointer"
>
  Dashboard
</button>

          <p className="text-white">
  Welcome back, {userName}!
</p>

          
<button
  onClick={() => {
    document
      .getElementById("applications")
      ?.scrollIntoView({ behavior: "smooth" });

    setSidebarOpen(false);
  }}
  className="w-full text-left p-3 rounded-lg hover:bg-gray-700 cursor-pointer"
>
  Applications
</button>


          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-700 cursor-pointer">
    Profile
  </button>
        </nav>
        <button
  onClick={handleLogout}
  className="w-full text-left text-red-400 hover:text-red-300 cursor-pointer"
>
  Logout
</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <button
  onClick={() => setSidebarOpen(true)}
  className="lg:hidden mb-4 text-gray-800 text-2xl"
>
  ☰
</button>
        {/* Navbar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-500">Track your job applications</p>
          </div>

          <button
  onClick={() => setShowModal(true)}
  className="bg-blue-600 text-white px-5 py-2 rounded-lg cursor-pointer w-full sm:w-auto"
>
  + Add Application
</button>
        </div>

        {/* Stats */}
<div className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          <div className="w-full min-w-0 bg-white p-4 sm:p-6 rounded-xl shadow">
            <p className="text-gray-500">Total Applications</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-500">{stats.total}</h3>
          </div>

          <div className="w-full min-w-0 bg-white p-4 sm:p-6 rounded-xl shadow">
            <p className="text-gray-500">Applied</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-500">{stats.applied}</h3>
          </div>

          <div className="w-full min-w-0 bg-white p-4 sm:p-6 rounded-xl shadow">
            <p className="text-gray-500">Interviews</p>
            <h3 className="text-3xl font-bold mt-2 text-gray-500">{stats.interview}</h3>
          </div>

         <div className="w-full min-w-0 bg-white p-4 sm:p-6 rounded-xl shadow">
  <p className="text-gray-500">Selected</p>
  <h3 className="text-3xl font-bold mt-2 text-gray-500">
    {stats.selected}
  </h3>
</div>
<div className="w-full min-w-0 bg-white p-4 sm:p-6 rounded-xl shadow">
  <p className="text-gray-500">Rejected</p>
  <h3 className="text-3xl font-bold mt-2 text-gray-500">
    {stats.rejected}
  </h3>
</div>

        </div>
      <div
  id="applications"
  className="bg-white rounded-xl shadow mt-8 overflow-hidden"
>

  <div className="p-6 border-b">
    <h2 className="text-xl font-bold text-gray-800">
      Recent Applications
    </h2>
  </div>
  <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row gap-4">

  <input
    type="text"
    value={search}
    onChange={(e) => {
  setSearch(e.target.value);
  setPage(1);
}}
    placeholder="Search company or position..."
    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
  />

  <select
    value={filterStatus}
   onChange={(e) => {
  setFilterStatus(e.target.value);
  setPage(1);
}}
    className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none"
  >
    <option value="">All Status</option>
    <option value="Applied">Applied</option>
    <option value="Interview">Interview</option>
    <option value="Selected">Selected</option>
    <option value="Rejected">Rejected</option>
  </select>

</div>
{loading && (
  <div className="p-6 text-center text-gray-600">
    Loading applications...
  </div>
)}
{error && (
  <div className="p-6 text-center text-red-600">
    {error}
  </div>
)}

  <div className="overflow-x-auto">
    <table className="w-full">

      <thead className="bg-gray-50">
        <tr>
          <th className="text-left p-4 text-gray-500">Company</th>
          <th className="text-left p-4 text-gray-500">Position</th>
          <th className="text-left p-4 text-gray-500">Date</th>
          <th className="text-left p-4 text-gray-500">Status</th>
          <th className="text-left p-4 text-gray-500">Notes</th>
          <th className="text-left p-4 text-gray-500">Actions</th>
        </tr>
      </thead>

      <tbody>
  {applications.length === 0 ? (
    <tr>
      <td
        colSpan={6}
        className="p-8 text-center text-gray-500"
      >
        No applications found
      </td>
    </tr>
  ) : (
    applications.map((application) => (
      <tr key={application.id} className="border-t">

            <td className="p-4 text-gray-900">
  {application.company_name}
</td>

<td className="p-4 text-gray-900">
  {application.position}
</td>
<td className="p-4 text-gray-900">
  {new Date(application.application_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>

<td className="p-4">
  <select
    value={application.status}
    onChange={(e) =>
      handleStatusChange(application.id, e.target.value)
    }
    className={`px-3 py-1 rounded-full text-sm font-medium border outline-none ${
      application.status === "Applied"
        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
        : application.status === "Interview"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : application.status === "Selected"
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-red-100 text-red-700 border-red-200"
    }`}
  >
    <option value="Applied">Applied</option>
    <option value="Interview">Interview</option>
    <option value="Selected">Selected</option>
    <option value="Rejected">Rejected</option>
  </select>
</td>

<td className="p-4 text-gray-900">
  {application.notes || "-"}
</td>
<td className="p-4">
  <div className="flex gap-3">
    <button
      onClick={() => handleEditClick(application)}
      className="text-blue-600 hover:text-blue-800 font-medium"
    >
      Edit
    </button>

    <button
      onClick={() => handleDeleteApplication(application.id)}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Delete
    </button>
  </div>
</td>

          </tr>
    ))
  )}
</tbody>

    </table>
  </div>


<div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-6 border-t">

  <button
    onClick={() => setPage(page - 1)}
    disabled={page === 1}
    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 text-black cursor-pointer"
  >
    Previous
  </button>

  <span className="text-gray-700">
    Page {page} of {totalPages}
  </span>

  <button
    onClick={() => setPage(page + 1)}
    disabled={page === totalPages}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 cursor-pointer"
  >
    Next
  </button>
</div>
</div>
        {showModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Add New Application
      </h2>

      <div className="space-y-4">

        <div>
          <label className="block text-gray-700 mb-2">
            Company Name
          </label>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Enter company name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Position
          </label>

          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Enter position"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none"
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
  type="button"
  onClick={handleAddApplication}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
>
  Add Application
</button>

        </div>

      </div>
    </div>
  </div>
)}
{editModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">

      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Edit Application
      </h2>

      <div className="space-y-4">

        <div>
          <label className="block text-gray-700 mb-2">
            Company Name
          </label>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Position
          </label>

          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none"
          >
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">

          <button
            type="button"
            onClick={() => setEditModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpdateApplication}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>

        </div>

      </div>
    </div>
  </div>
)}
      </main>
      
    </div>
  );
}
