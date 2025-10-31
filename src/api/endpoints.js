export const API = {
  auth: {
    register: { method: "POST", url: "/api/Auth/register" },
    login: { method: "POST", url: "/api/Auth/login" },
    refresh: { method: "POST", url: "/api/Auth/refresh" },
    logout: { method: "POST", url: "/api/Auth/logout" },
  },

  account: {
    getOwnProfile: { method: "GET", url: "/api/Account/get-own-profile" },
    getCompanyProfile: { method: "GET", url: "/api/Account/get-company-profile" },
    updateProfileInformation: { method: "PATCH", url: "/api/Account/profile-informaion" },
    deleteAccount: { method: "DELETE", url: "/api/Account/delete-account" },
  },

  chat: {
    getChats: { method: "GET", url: "/api/Chat/get-chats" },
  },

  companyWorkTask: {
    getAll: { method: "GET", url: "/api/CompanyWorkTask/get-all" },
    getById: { method: "GET", url: "/api/CompanyWorkTask/get-by-id" },
    apply: { method: "POST", url: "/api/CompanyWorkTask/apply" },
  },

  opinion: {
    getAllPoss: { method: "GET", url: "/api/Opinion/get-all-poss" },
    rate: { method: "POST", url: "/api/Opinion/rate" },
    outsideRate: { method: "POST", url: "/api/Opinion/outside-rate" },
  },

  userWorkTasks: {
    getById: { method: "GET", url: "/api/UserWorkTasks/get-by-id" },
    getOwn: { method: "GET", url: "/api/UserWorkTasks/get-own" },
    publish: { method: "POST", url: "/api/UserWorkTasks/publish" },
    changeApplicationStatus: { method: "PATCH", url: "/api/UserWorkTasks/change-application-status" },
    completeRealization: { method: "PATCH", url: "/api/UserWorkTasks/complete-realization" },
  },
};