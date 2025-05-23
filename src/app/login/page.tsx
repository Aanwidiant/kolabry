'use client'
import React, {useState} from "react";
import {Eye, EyeSlash} from "@/components/icons";
import Fetch from "@/utilities/fetch";
import {toast} from "react-toastify";
import useAuthStore from "@/store/authStore";
import {useRouter} from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await Fetch.POST("/user/login", {email, password});

            if (res.success) {
                login(res.data.token, res.data.user);
                toast.success(res.message || "Login berhasil!");
                router.push("/dashboard");
            } else {
                toast.error(res.message || "Login gagal!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="w-full min-h-screen grid grid-cols-2 bg-light">
            <div className="hidden md:col-span-1 m-2 p-12 rounded-xl bg-primary md:flex flex-col justify-center gap-4">
                <h1 className='text-3xl font-bold tracking-widest text-white'>KOLABRY</h1>
                <h2 className='text-xl text-light font-medium tracking-wide'>Lorem ipsum dolor sit amet, consectetur
                    adipisicing elit. Ipsa, quae.</h2>
                <div className="w-96 h-80 self-center bg-secondary rounded-xl">
                    <p className='w-full h-full text-center place-content-center'>for image</p>
                </div>
                <p className='text-light font-light text-sm'>Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Accusamus autem consectetur, eius eos ex exercitationem fuga ipsum modi sunt temporibus!</p>
            </div>
            <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                <div className="w-full max-w-md p-4 space-y-8">
                    <h2 className='text-2xl font-bold tracking-wide'>Hello, Welcome to <span
                        className='text-primary'>Kolabry</span></h2>
                    <p className='text-gray font-light text-sm'>Enter your email and password to access your
                        account.</p>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="font-medium text-dark text-sm">
                                Email
                            </label>
                            <input type="email" id="email" name="email" required
                                   onChange={(e) => setEmail(e.target.value)}
                                   className="w-full rounded-md border bg-transparent p-2 text-sm text-dark placeholder-gray border-gray outline-none focus:border-2 focus:border-primary focus:ring-2 focus:ring-secondary transition-all duration-150 ease-in-out"
                                   placeholder="Email"/>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="font-medium text-dark text-sm">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-md border bg-transparent p-2 pr-10 text-sm text-dark placeholder-gray border-gray outline-none focus:border-2 focus:border-primary focus:ring-2 focus:ring-secondary transition-all duration-150 ease-in-out"
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray hover:text-dark transition"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeSlash className="fill-dark w-5 h-5"/> :
                                        <Eye className="fill-dark w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-fit text-light bg-primary hover:bg-secondary hover:shadow-sm hover:shadow-gray font-medium rounded-lg px-6 py-2 cursor-pointer"
                        >
                            {loading ? "Loading..." : "Login"}
                        </button>
                    </form>
                    <p className='w-full text-center text-gray font-light text-sm'>Don`t have an account? <span
                        className='text-primary underline underline-offset-2 cursor-pointer hover:text-secondary whitespace-nowrap'>Contact Admin Now!</span>
                    </p>
                    <p className='px-4 text-sm font-light text-gray mx-auto text-center'>By continuing, you agree to
                        our <span
                            className='text-primary underline underline-offset-2 cursor-pointer hover:text-secondary whitespace-nowrap'>Terms & Conditions</span> and <span
                            className='text-primary underline underline-offset-2 cursor-pointer hover:text-secondary whitespace-nowrap'>Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </main>
    )
}