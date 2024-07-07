import { StudentForm } from "@/app/register/StudentForm";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function RegisterStudentPage() {
    return (
        <div className="flex flex-col gap-4 ">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Register Student
            </h1>
            <div className=" gap-y-6">
                <StudentForm />
            </div>

            <ToastContainer />
        </div>
    );
}