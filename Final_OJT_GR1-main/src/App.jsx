// import { Layout, theme } from "antd";
// import React, { useState } from "react";
// import { Navigate, Route, Routes } from "react-router-dom";
// import ResetPassword from "../src/pages/ResetPassword";
// import AccountInfo from "./Components/AccountInfo.jsx";
// import ChangePassword from "./Components/ChangePassword";
// import EmployeeManagement from "./Components/EmployeeManagement";
// import LanguageManagement from "./Components/LanguageManagement";
// import NewProject from "./Components/NewProject";
// import PositionManagement from "./Components/PositionManagement";
// import ProjectManagement from "./Components/ProjectManagement";
// import Sidebar from "./Components/Sidebar";
// import TechnologyManagement from "./Components/TechnologyManagement";
// import AddTechnology from "./Components/AddTechnology";
// import EditTechnology from "./Components/EditTechnology";
// // import EditTechnology from './Components/EditTechnology';
// import TechnologyDetails from "./Components/TechnologyDetails";
// import Admin from "./pages/Admin";
// import ForgetPassword from "./pages/ForgetPassword";
// import Login from "./pages/LoginPage";
// import PageCV from "./pages/PageCV";
// import ProjectDetail from "./Components/ProjectDetail";
// import ArchivedProjects from "./Components/ArchivedProjects";
// import AddPosition from "./Components/AddPosition";
// import ProjectEdit from "./Components/ProjectEdit";
// import EditPosition from "./Components/EditPosition";
// import PositionDetails from "./Components/PositionDetails";
// import AddLanguage from "./Components/AddLanguage";
// import EditLanguage from "./Components/EditLanguage";
// import LanguageDetails from "./Components/LanguageDetails";
// import AddEmployee from "./Components/AddEmployee";
// import EditEmployee from "./Components/EditEmployee";
// import EmployeeDetails from "./Components/EmployeeDetails";
// import EmployeeProjectManagement from "./Components/EmployeeProjectManagement";
// import SkillManagement from "./Components/SkillManagement.jsx";
// import AddSkill from "./Components/AddSkill.jsx";
// import EditSkill from "./Components/EditSkill.jsx";

// const { Content } = Layout;

// const App = () => {
//   const {
//     token: { colorBgContainer },
//   } = theme.useToken();

//   const [user, setUser] = useState(() => {
//     const storedUser = localStorage.getItem("user");
//     return storedUser ? JSON.parse(storedUser) : null;
//   });

//   const handleLogin = (userInfo) => {
//     setUser(userInfo);
//   };

//   // eslint-disable-next-line react/prop-types
//   const ProtectedRoute = ({ children }) => {
//     if (!user) {
//       return <Navigate to="/login" />;
//     }
//     return children;
//   };

//   return (
//     <div>
//       <Routes>
//         <Route path="/login" element={<Login setUser={handleLogin} />} />
//         <Route path="/forget-password" element={<ForgetPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />

//         <Route
//           path="/*"
//           element={
//             <ProtectedRoute>
//               <Layout style={{ minHeight: "100vh" }}>
//                 {user && <Sidebar role={user.role} />}
//                 <Layout
//                   style={{ marginLeft: user && user.role === "admin" ? 0 : 0 }}
//                 >
//                   <Content
//                     style={{ margin: "24px 16px 0", overflow: "initial" }}
//                   >
//                     <div style={{ padding: 24, background: colorBgContainer }}>
//                       <Routes>
//                         <Route path="/employee" element={<AccountInfo />} />
//                         <Route path="/cv" element={<PageCV />} />
//                         <Route path="/account-management" element={<Admin />} />
//                         <Route path="/account-info" element={<AccountInfo />} />
//                         <Route
//                           path="/change-password"
//                           element={<ChangePassword />}
//                         />
//                         <Route
//                           path="/employee-management"
//                           element={<EmployeeManagement />}
//                         />
//                         <Route
//                           path="/employee-management/add"
//                           element={<AddEmployee />}
//                         />
//                         <Route
//                           path="/employee-management/edit/:id"
//                           element={<EditEmployee />}
//                         />
//                         <Route
//                           path="/employee-management/view/:id"
//                           element={<EmployeeDetails />}
//                         />
//                         <Route
//                           path="/project-management"
//                           element={<ProjectManagement />}
//                         />
//                         <Route
//                           path="/project/:id"
//                           element={<ProjectDetail />}
//                         />
//                         <Route
//                           path="/edit-project/:id"
//                           element={<ProjectEdit />}
//                         />
//                         <Route
//                           path="/archived-projects"
//                           element={<ArchivedProjects />}
//                         />
//                         <Route
//                           path="/position-management"
//                           element={<PositionManagement />}
//                         />
//                         <Route
//                           path="/position-management/add"
//                           element={<AddPosition />}
//                         />
//                         <Route
//                           path="/position-management/edit/:id"
//                           element={<EditPosition />}
//                         />
//                         <Route
//                           path="/position-management/view/:id"
//                           element={<PositionDetails />}
//                         />
//                         <Route
//                           path="/position-management/skill/add"
//                           element={<AddSkill />}
//                         />
//                         <Route
//                           path="/position-management/skill/edit/:id"
//                           element={<EditSkill />}
//                         />
//                         <Route
//                           path="/technology-management"
//                           element={<TechnologyManagement />}
//                         />
//                         <Route
//                           path="/technology-management/add"
//                           element={<AddTechnology />}
//                         />
//                         <Route
//                           path="/technology-management/edit/:id"
//                           element={<EditTechnology />}
//                         />
//                         <Route
//                           path="/technology-management/view/:id"
//                           element={<TechnologyDetails />}
//                         />
//                         <Route
//                           path="/programing-language"
//                           element={<LanguageManagement />}
//                         />
//                         <Route
//                           path="/programing-language/add"
//                           element={<AddLanguage />}
//                         />
//                         <Route
//                           path="/programing-language/edit/:id"
//                           element={<EditLanguage />}
//                         />
//                         <Route
//                           path="/programing-language/view/:id"
//                           element={<LanguageDetails />}
//                         />
//                         <Route
//                           path="/employee-ProjectManagement"
//                           element={<EmployeeProjectManagement />}
//                         />
//                         <Route path="/new-project" element={<NewProject />} />
//                         <Route path="/" element={<Navigate to="/login" />} />
//                       </Routes>
//                     </div>
//                   </Content>
//                 </Layout>
//               </Layout>
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </div>
//   );
// };

// export default App;
import { Layout, theme } from "antd";
import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ResetPassword from "../src/pages/ResetPassword";
import AccountInfo from "./Components/AccountInfo.jsx";
import ChangePassword from "./Components/ChangePassword";
import EmployeeManagement from "./Components/EmployeeManagement";
import LanguageManagement from "./Components/LanguageManagement";
import NewProject from "./Components/NewProject";
import PositionManagement from "./Components/PositionManagement";
import ProjectManagement from "./Components/ProjectManagement";
import Sidebar from "./Components/Sidebar";
import TechnologyManagement from "./Components/TechnologyManagement";
import AddTechnology from "./Components/AddTechnology";
import EditTechnology from "./Components/EditTechnology";
import TechnologyDetails from "./Components/TechnologyDetails";
import Admin from "./pages/Admin";
import ForgetPassword from "./pages/ForgetPassword";
import Login from "./pages/LoginPage";
import PageCV from "./pages/PageCV";
import ProjectDetail from "./Components/ProjectDetail";
import ArchivedProjects from "./Components/ArchivedProjects";
import AddPosition from "./Components/AddPosition";
import ProjectEdit from "./Components/ProjectEdit";
import EditPosition from "./Components/EditPosition";
import PositionDetails from "./Components/PositionDetails";
import AddLanguage from "./Components/AddLanguage";
import EditLanguage from "./Components/EditLanguage";
import LanguageDetails from "./Components/LanguageDetails";
import AddEmployee from "./Components/AddEmployee";
import EditEmployee from "./Components/EditEmployee";
import EmployeeDetails from "./Components/EmployeeDetails";
import EmployeeProjectManagement from "./Components/EmployeeProjectManagement";
import SkillManagement from "./Components/SkillManagement.jsx";
import AddSkill from "./Components/AddSkill.jsx";
import EditSkill from "./Components/EditSkill.jsx";
import ProjectTracking from "./Components/ProjectTracking"; // Import the new component

const { Content } = Layout;

const App = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = (userInfo) => {
    setUser(userInfo);
  };

  // eslint-disable-next-line react/prop-types
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login setUser={handleLogin} />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout style={{ minHeight: "100vh" }}>
                {user && <Sidebar role={user.role} />}
                <Layout
                  style={{ marginLeft: user && user.role === "admin" ? 0 : 0 }}
                >
                  <Content
                    style={{ margin: "24px 16px 0", overflow: "initial" }}
                  >
                    <div style={{ padding: 24, background: colorBgContainer }}>
                      <Routes>
                        <Route path="/employee" element={<AccountInfo />} />
                        <Route path="/cv" element={<PageCV />} />
                        <Route path="/account-management" element={<Admin />} />
                        <Route path="/account-info" element={<AccountInfo />} />
                        <Route
                          path="/change-password"
                          element={<ChangePassword />}
                        />
                        <Route
                          path="/employee-management"
                          element={<EmployeeManagement />}
                        />
                        <Route
                          path="/employee-management/add"
                          element={<AddEmployee />}
                        />
                        <Route
                          path="/employee-management/edit/:id"
                          element={<EditEmployee />}
                        />
                        <Route
                          path="/employee-management/view/:id"
                          element={<EmployeeDetails />}
                        />
                        <Route
                          path="/project-management"
                          element={<ProjectManagement />}
                        />
                        <Route
                          path="/project/:id"
                          element={<ProjectDetail />}
                        />
                        <Route
                          path="/edit-project/:id"
                          element={<ProjectEdit />}
                        />
                        <Route
                          path="/archived-projects"
                          element={<ArchivedProjects />}
                        />
                        <Route
                          path="/position-management"
                          element={<PositionManagement />}
                        />
                        <Route
                          path="/position-management/add"
                          element={<AddPosition />}
                        />
                        <Route
                          path="/position-management/edit/:id"
                          element={<EditPosition />}
                        />
                        <Route
                          path="/position-management/view/:id"
                          element={<PositionDetails />}
                        />
                        <Route
                          path="/position-management/skill/add"
                          element={<AddSkill />}
                        />
                        <Route
                          path="/position-management/skill/edit/:id"
                          element={<EditSkill />}
                        />
                        <Route
                          path="/technology-management"
                          element={<TechnologyManagement />}
                        />
                        <Route
                          path="/technology-management/add"
                          element={<AddTechnology />}
                        />
                        <Route
                          path="/technology-management/edit/:id"
                          element={<EditTechnology />}
                        />
                        <Route
                          path="/technology-management/view/:id"
                          element={<TechnologyDetails />}
                        />
                        <Route
                          path="/programing-language"
                          element={<LanguageManagement />}
                        />
                        <Route
                          path="/programing-language/add"
                          element={<AddLanguage />}
                        />
                        <Route
                          path="/programing-language/edit/:id"
                          element={<EditLanguage />}
                        />
                        <Route
                          path="/programing-language/view/:id"
                          element={<LanguageDetails />}
                        />
                        <Route
                          path="/employee-ProjectManagement"
                          element={<EmployeeProjectManagement />}
                        />
                        <Route path="/new-project" element={<NewProject />} />
                        <Route
                          path="/project-tracking/:id"
                          element={<ProjectTracking />}
                        />{" "}
                        {/* Add this line */}
                        <Route path="/" element={<Navigate to="/login" />} />
                      </Routes>
                    </div>
                  </Content>
                </Layout>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
