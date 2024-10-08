import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { StudentForm } from "./StudentForm";

import type { Student } from "@repo/models/Student";
import useMediaQuery from "@custom-react-hooks/use-media-query";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

type StudentFormDialogProps = {
	student?: Student;
};

const StudentFormDialog = ({ student }: StudentFormDialogProps) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const { toast } = useToast();

	const title = "Edit student";
	const description =
		"Make changes to the student here. Click save when you're done.";



	const handleClose = () => {
		setIsOpen(false);
		toast({
			description: "Your changes have been saved!",
			duration: 2250,
		});
	};

	const handleError = (message: string) => {
		toast({
			description: message,
			duration: 2250,
		});
	};



	if (isDesktop) {
		return (
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger>
					<Button variant="ghost" className="">
						Edit
					</Button>
				</DialogTrigger>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription className="text-balance">
							{description}
						</DialogDescription>
					</DialogHeader>

					<StudentForm student={student} handleClose={handleClose} handleError={handleError} />

					{/* <DialogFooter>
                <Button type="submit">Save changes</Button>
            </DialogFooter> */}
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger>
				<Button variant="ghost" className="">
					Edit
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle className="text-xl">{title}</DrawerTitle>
					<DrawerDescription className="text-balance text-xs px-4">
						{description}
					</DrawerDescription>
				</DrawerHeader>

				<div className="p-4">
					<StudentForm student={student} handleClose={handleClose} handleError={handleError} />
				</div>

				<DrawerFooter>
					{/* <Button>Submit</Button> */}
					<DrawerClose>
						<Button variant="ghost" className="w-full">
							Cancel
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default StudentFormDialog;
