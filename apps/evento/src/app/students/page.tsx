"use client";

import { useQuery } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Separator } from "@/components/ui/separator";
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { BellIcon, CheckIcon } from "@radix-ui/react-icons";

// import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
	Building2,
	Calendar,
	Clock,
	Ellipsis,
	Filter,
	Hash,
	MapPin,
	Pencil,
	Plus,
	TableProperties,
	Trash,
	UserRound,
} from "lucide-react";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type Department, getDepartments } from "@repo/models/Department";
import {
	type Student,
	deactivateStudent,
	getAllStudents,
	getFilteredPaginatedStudents,
	getStudentFullName,
} from "@repo/models/Student";
import StudentFormDialog from "./StudentFormDialog";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import StudentRecordsDialog from "../../components/StudentRecordsDialog";
import Search from "@/app/students/Search";
import PaginationComponent from "./Pagination";
import Loading from "@/components/Loading";
import { stat } from "fs/promises";
import StudentCardSkeleton from "@/components/skeleton/StudentCardSkeleton";
import { set } from "date-fns";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { getFilteredPaginatedSchoolIds } from "@repo/models/Attendance";

type StudentsPageProps = {
	searchParams?: {
		query?: string;
		page?: string;
	};
};



export default function StudentsPage({ searchParams }: StudentsPageProps) {


	// const size = 9;
	// const skeletons = new Array(size).fill(undefined);


	const query = searchParams?.query || '';
	const currentPage = Number(searchParams?.page) || 1;

	const [departmentFilter, setDepartmentFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<"active" | "inactive">(
		"active",
	);
	const [isCompactView, setIsCompactView] = useState(false);
	const [isRenderStudentsList, setIsRenderStudentsList] = useState(true)


	const {
		data: { students = [], count: studentRowCount = null } = {},
		error: studentsError,
		isLoading: isStudentsLoading,
		isSuccess: isStudentsSuccess,
	} = useQuery<{ students: Student[]; count: number | null }>({
		queryKey: ["paginatedStudents", query, currentPage, departmentFilter, statusFilter],
		queryFn: () => getFilteredPaginatedStudents(currentPage, query, departmentFilter !== "all" ? Number(departmentFilter) : null, statusFilter === "active"),
	});



	const {
		data: { schoolIds = [], count: schoolIdRowCount = null } = {},
		error: schoolIdsError,
		isLoading: isSchoolIdsLoading,
		isSuccess: isSchoolIdsSuccess,
	} = useQuery<{ schoolIds: string[]; count: number | null }>({
		queryKey: ["paginatedSchoolIds", query, currentPage],
		queryFn: () => getFilteredPaginatedSchoolIds(currentPage, query),
	});




	const {
		data: departments = [],
		error: departmentsError,
		isLoading: isDepartmentsLoading,
	} = useQuery<Department[]>({
		queryKey: ["departments"],
		queryFn: getDepartments,
	});




	const resetFilters = () => {
		setStatusFilter("active");
		setDepartmentFilter("all");
	};

	const countActiveFilters = () => {
		let count = 0;
		if (isCompactView) count++;
		if (statusFilter !== "active") count++;
		if (departmentFilter !== "all") count++;
		return count;
	};


	const [prevStudentCount, setPrevStudentCount] = useState<number>(0);
	const [prevSchoolIdCount, setPrevSchoolIdCount] = useState<number>(0);

	useEffect(() => {
		if (isStudentsSuccess) {
			setPrevStudentCount(students.length);
			console.warn("prevStudentCount", students.length);
		}

		if (isSchoolIdsSuccess) {
			setPrevSchoolIdCount(schoolIds.length);
			console.warn("prevSchoolIdCount", schoolIds.length)
		}
	}, [isStudentsSuccess, isSchoolIdsSuccess]);




	return (
		<div className="flex flex-col h-full gap-3">
			<div className="flex justify-between gap-2 items-center">
				<div className="flex mr-auto gap-4">
					<h1 className="text-2xl font-bold tracking-tight ">Students</h1>
					<div className="flex items-center space-x-2">
						<Switch id="id-only-mode" onCheckedChange={() => setIsRenderStudentsList(!isRenderStudentsList)} />
						<Label htmlFor="id-only-mode" className="">Attendance Based</Label>
					</div>
					{/* <Link href="/students/create">
					<Button variant={"ghost"}>
						<Plus className="size-4" />
						Add
					</Button>
				</Link> */}
				</div>



				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline">
							<Filter className="mr-2 size-4" />
							Filter
							{countActiveFilters() > 0 && (
								<Badge variant={"destructive"} className="ml-2">
									{countActiveFilters()}
								</Badge>
							)}
						</Button>
					</SheetTrigger>
					<SheetContent className="flex h-full justify-center flex-col">
						<SheetHeader>
							<SheetTitle>Filter Students</SheetTitle>
							<SheetDescription className="text-balance">
								Select filters to apply
							</SheetDescription>
						</SheetHeader>
						<div className="flex gap-1 flex-col justify-evenly py-4 ">
							<div className="flex items-center justify-between space-x-2 border rounded-md p-2">
								<Label htmlFor="compact-view">Compact View</Label>
								<Switch
									checked={isCompactView}
									onCheckedChange={setIsCompactView}
									id="compact-mode"
								/>
							</div>

							{/* ADD FILTERS HERE */}
							<p className="text-xs mt-2 opacity-50">Status</p>

							<Select
								onValueChange={(value: "active" | "inactive") =>
									setStatusFilter(value)
								}
								value={statusFilter}
							>
								<SelectTrigger className="">
									<SelectValue placeholder="All Departments" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Status</SelectLabel>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>

							<p className="text-xs mt-2 opacity-50">Department</p>

							<Select
								onValueChange={(value) => setDepartmentFilter(value)}
								value={departmentFilter}
							>
								<SelectTrigger className="">
									<SelectValue placeholder="All Departments" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Departments</SelectLabel>
										<SelectItem value="all">All Departments</SelectItem>
										{departments?.map((department) => (
											<SelectItem
												key={department.id}
												value={department.id.toString()}
											>
												{department.short_name}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<SheetFooter className="flex gap-2 flex-col">
							<SheetClose asChild>
								<Button type="submit" className="w-full mx-auto">
									Apply Filters
								</Button>
							</SheetClose>
							<Button
								className="mt-20 w-full"
								onClick={resetFilters}
								variant={"ghost"}
							>
								Reset Filters
							</Button>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			</div>

			<div className="flex gap-2 flex-col justify-evenly">
				<Search />
			</div>


			{isRenderStudentsList
				? renderStudentList(isStudentsLoading, prevStudentCount, students, studentRowCount, departments)
				: renderSchoolIdList(isSchoolIdsLoading, prevSchoolIdCount, schoolIds, schoolIdRowCount)
			}


			{/* {renderStudentList(isStudentsLoading, prevStudentCount, students, studentRowCount, departments)} */}






			<ToastContainer />
		</div>
	);
}

const renderSkeleton = (count: number) => {
	const size = count;
	const skeletons = new Array(size).fill(undefined);

	return (
		<div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 overflow-y-auto rounded-md w-full">
			{skeletons.map((index, skeleton) => (
				<StudentCardSkeleton key={index} />
			))}
		</div>
	);
};





function renderStudentList(isLoading: boolean, prevStudentCount: number, students: Student[], studentRowCount: number | null, departments: Department[]) {

	function getDepartmentNameById(departmentId: number): string | undefined {
		const department = departments.find((dept) => dept.id === departmentId);
		return department ? department.short_name : undefined;
	}

	return (
		<>
			{isLoading ? renderSkeleton(prevStudentCount) : null}


			{students.length > 0 && !isLoading ? (
				<div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 overflow-y-auto rounded-md w-full">
					{students.map((student) => (
						<div
							key={`${student.created_at}-${student.school_id}`}
							className="p-5 rounded-lg flex flex-col gap-1 backdrop-contrast-50 backdrop-opacity-20"
						>
							<div className="flex justify-between items-center">
								<div className="flex gap-2 items-center">
									<UserRound className="size-5" />
									<h2 className="font-bold">{getStudentFullName(student)}</h2>
									{student.dept_id && (
										<Badge className="flex gap-1" variant={"secondary"}>
											<Building2 className="size-3" />
											{getDepartmentNameById(student.dept_id)}
										</Badge>
									)}
								</div>


								{/* <div className="flex gap-4 items-center">
						<DropdownMenu>
							<DropdownMenuTrigger className=" rounded-full text-sm flex gap-2 items-center">
								<Ellipsis className=" " />
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuLabel>Actions</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem asChild>
									<StudentFormDialog student={student} />
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => deactivateStudent(student)}
								>
									<Trash className="size-4 mr-2" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div> */}
							</div>

							<div className="flex gap-2 flex-wrap mt-1 justify-between">
								<div className="flex gap-2 items-center opacity-50">
									<p className="font-semibold text-sm">{student.school_id}</p>
									<StudentRecordsDialog student={student} />
								</div>
							</div>
						</div>
					))}
				</div>


			) : (
				<div className="flex flex-col mx-auto gap-4 p-20 opacity-50">
					<p>No students</p>
				</div>
			)}


			<PaginationComponent totalItems={studentRowCount} itemsPerPage={10} /></>
	)
}


function renderSchoolIdList(isLoading: boolean, prevSchoolIdCount: number, schoolIds: string[], schoolIdRowCount: number | null) {
	return (<>
		{isLoading ? renderSkeleton(prevSchoolIdCount) : null}


		{
			schoolIds.length > 0 && !isLoading ? (
				<div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 overflow-y-auto rounded-md w-full">
					{schoolIds.map((schoolId) => (
						<div
							key={schoolId}
							className="p-5 rounded-lg flex flex-col gap-1 backdrop-contrast-50 backdrop-opacity-20"
						>
							<div className="flex justify-between items-center">
								<div className="flex gap-2 items-center">
									<UserRound className="size-5" />
									<h2 className="font-bold">{schoolId}</h2>


								</div>

								<div className="flex gap-2 flex-wrap mt-1 justify-between">
									<div className="flex gap-2 items-center opacity-50">
										<StudentRecordsDialog schoolId={schoolId} />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>


			) : (
				<div className="flex flex-col mx-auto gap-4 p-20 opacity-50">
					<p>No students</p>
				</div>
			)
		}

		<PaginationComponent totalItems={schoolIdRowCount} itemsPerPage={10} />
	</>
	)
}
