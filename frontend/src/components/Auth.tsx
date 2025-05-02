import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignupInput, SigninInput } from "@vatscode/medium-common";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState(type === "signup" ? {
        email: "",
        password: "",
        name: ""
    } : {
        email: "",
        password: ""
    });

    async function sendRequest() {
        try {
            const url = `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`;
            console.log('Making request to:', url);
            console.log('With data:', JSON.stringify(postInputs, null, 2));
            console.log('Data types:', {
                email: typeof postInputs.email,
                password: typeof postInputs.password,
                name: typeof postInputs.name
            });
            const response = await axios.post(url, postInputs, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Response:', response.data);
            const { token, userId } = response.data;
            if (!token) {
                throw new Error('No token received');
            }
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            navigate("/");
        } catch(e: any) {
            console.error('Full error object:', e);
            console.error('Request data that failed:', postInputs);
            console.error('Error status:', e.response?.status);
            console.error('Error data:', e.response?.data);
            const errorMessage = e.response?.data?.message || e.message || "Error while signing up";
            alert(errorMessage);
        }
    }
    
    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
                <div className="px-10">
                    <div className="text-3xl font-extrabold">
                        Create an account
                    </div>
                    <div className="text-slate-500">
                        {type === "signin" ? "Don't have an account?" : "Already have an account?" }
                        <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                            {type === "signin" ? "Sign up" : "Sign in"}
                        </Link>
                    </div>
                </div>
                <div className="pt-8">
                    {type === "signup" ? <LabelledInput label="Name" placeholder="Vats Upadhyay..." onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }} /> : null}
                    <LabelledInput label="Email" placeholder="vats@gmail.com" onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            email: e.target.value
                        })
                    }} />
                    <LabelledInput label="Password" type={"password"} placeholder="123456" onChange={(e) => {
                        setPostInputs({
                            ...postInputs,
                            password: e.target.value
                        })
                    }} />
                    <button onClick={sendRequest} type="button" className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{type === "signup" ? "Sign up" : "Sign in"}</button>
                </div>
            </div>
        </div>
    </div>
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return <div>
        <label className="block mb-2 text-sm text-black font-semibold pt-4">{label}</label>
        <input onChange={onChange} type={type || "text"} id="first_name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder={placeholder} required />
    </div>
}