import { LoaderCircle } from "lucide-react";

interface LoadingProps {
    text: string;
}

const Loading: React.FC<LoadingProps> = ({ text }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <LoaderCircle className="animate-spin size-12" />
            <h1 className="text-xl font-semibold">{text}</h1>
        </div>
    );
};

export default Loading;
