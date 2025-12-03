/* eslint-disable */

const CONST = {
  URL: "http://localhost:8080/api",
  TIMEOUT_LOGIN: 30000, // 30 giây timeout
};

const APIController = async (endpoint, body, signal) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const response = await fetch(CONST.URL + endpoint, {
      signal,
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    // Xử lý response
    if (!response.ok) {
      // Nếu lỗi 403/401 thì clear token
      if (response.status === 403 || response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Hàm GET
const APIControllerGET = async (endpoint, signal) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(CONST.URL + endpoint, {
      signal,
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const API = {
  APIController,
  APIControllerGET,
  CONST,
};