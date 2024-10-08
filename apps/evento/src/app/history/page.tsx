"use client";

import { getAllAttendanceRecords, type AttendanceRecord } from "@repo/models/Attendance";
import { useQuery } from "@tanstack/react-query";
import AttendanceHistory from "./AttendanceHistory";

const HistoryPage: React.FC = () => {
	const {
		data: attendanceRecords = [],
		error,
		isLoading,
	} = useQuery<AttendanceRecord[]>({
		queryKey: ["attendanceRecords"],
		queryFn: getAllAttendanceRecords,
	});

	// if (isLoading) {
	//     return <p>Loading...</p>; // Optional loading state while data is fetched
	// }

	if (error) {
		return <p>Error: {error.message}</p>; // Optional error handling
	}

	return (
		<section className="flex flex-col gap-2">
			<h1 className="font-semibold text-lg">Recent scan results</h1>

			{/* {attendanceRecords.map((record: AttendanceRecord) => (
                record.time_out ? (
                    <TimeOutCard key={record.id} result={record} />
                ) : (
                    <TimeInCard key={record.id} result={record} />
                )
            ))} */}

			<AttendanceHistory />
		</section>
	);
};

export default HistoryPage;
