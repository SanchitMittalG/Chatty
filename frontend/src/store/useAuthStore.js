import {create} from "zustand"
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import {io} from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/";

export const useAuthStore = create((set , get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers : [],
    socket : null ,

    checkAuth : async () => {
        try {
            const res = await axiosInstance.get("/api/auth/check");
            console.log("res in checkAuth", res);
            set({authUser: res.data})

            get().connectSocket();
        } catch (error) {
            console.log("error in checkAuth", error);
            set({authUser: null})
        }
        finally{
            set({isCheckingAuth: false})
        }
    },

    signup: async (Data) => {
        set({isSigningUp: true});
        try {
            const res = await axiosInstance.post("/api/auth/signup", Data);
            console.log("res in signup", res);
            set({authUser: res.data});
            toast.success("Signup successful , Account created");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("error in signup", error);
        } finally {
            set({isSigningUp: false});
        }
    },

    login: async (Data) => {
        set({isLoggingIn: true});
        try {
            const res = await axiosInstance.post("/api/auth/login", Data);
            set({authUser: res.data});
            toast.success("Logged in successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
            const errorMessage =
      error?.response?.data?.message || "Something went wrong during login";
            console.log("error in login", error);
        } finally {
            set({isLoggingIn: false});
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/api/auth/logout");
            set({authUser: null});
            toast.success("Logged out successfully");

            get().disconnectSocket();
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("error in logout", error);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/api/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      connectSocket:() =>{
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
    
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
    
        set({ socket: socket });
    
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
      },

}));   

