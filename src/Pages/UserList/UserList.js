import React, { useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Paper, Button, Box } from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import Navbar from '../../Components/Navbar/Navbar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './UserList.css';
import FooterComp from '../../Components/FooterComp/FooterComp';


const initialData = [
    { id: 1, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "101", surname: "Sharma", name: "Amit", gothram: "Bharadwaj", dateOfBirth: "1990-02-10", age: 34, whatsapp: "9876543210", email: "amit.sharma@gmail.com", country: "India", state: "Maharashtra", district: "Mumbai", mandal: "Andheri", address: "12, Hill Road", nativePlace: "Pune", profession: "Engineer" },
    { id: 2, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "102", surname: "Verma", name: "Sunita", gothram: "Kashyap", dateOfBirth: "1985-07-15", age: 39, whatsapp: "9123456789", email: "sunita.verma@gmail.com", country: "India", state: "Gujarat", district: "Ahmedabad", mandal: "Maninagar", address: "21, Station Road", nativePlace: "Rajkot", profession: "Teacher" },
    { id: 3, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "103", surname: "Patel", name: "Rakesh", gothram: "Shandilya", dateOfBirth: "1978-03-24", age: 46, whatsapp: "9988776655", email: "rakesh.patel@yahoo.com", country: "India", state: "Rajasthan", district: "Jaipur", mandal: "Vaishali Nagar", address: "55, Lake View", nativePlace: "Udaipur", profession: "Doctor" },
    { id: 4, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "104", surname: "Rao", name: "Lakshmi", gothram: "Haritasya", dateOfBirth: "1992-09-08", age: 32, whatsapp: "9654321098", email: "lakshmi.rao@gmail.com", country: "India", state: "Karnataka", district: "Bangalore", mandal: "Jayanagar", address: "10, Temple Road", nativePlace: "Mysore", profession: "Accountant" },
    { id: 5, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "105", surname: "Singh", name: "Raj", gothram: "Bhrigu", dateOfBirth: "1980-05-18", age: 44, whatsapp: "9234567890", email: "raj.singh@gmail.com", country: "India", state: "Punjab", district: "Amritsar", mandal: "Golden Avenue", address: "3, Garden Road", nativePlace: "Jalandhar", profession: "Business" },
    { id: 6, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "106", surname: "Desai", name: "Nisha", gothram: "Vashistha", dateOfBirth: "1988-01-12", age: 36, whatsapp: "9123498765", email: "nisha.desai@gmail.com", country: "India", state: "Goa", district: "Panaji", mandal: "Bambolim", address: "4, Beach Side", nativePlace: "Margao", profession: "Chef" },
    { id: 7, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "107", surname: "Pandey", name: "Ravi", gothram: "Gautam", dateOfBirth: "1995-04-22", age: 29, whatsapp: "9345678901", email: "ravi.pandey@gmail.com", country: "India", state: "Madhya Pradesh", district: "Bhopal", mandal: "Arera Colony", address: "98, Green Park", nativePlace: "Indore", profession: "Photographer" },
    { id: 8, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "108", surname: "Iyer", name: "Priya", gothram: "Koundinya", dateOfBirth: "1983-11-30", age: 41, whatsapp: "9876543120", email: "priya.iyer@gmail.com", country: "India", state: "Kerala", district: "Kochi", mandal: "Fort Road", address: "76, Backwater View", nativePlace: "Trivandrum", profession: "Artist" },
    { id: 9, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "109", surname: "Kapoor", name: "Simran", gothram: "Atri", dateOfBirth: "1999-12-22", age: 25, whatsapp: "9012345678", email: "simran.kapoor@gmail.com", country: "India", state: "Delhi", district: "New Delhi", mandal: "South Extension", address: "54, City Centre", nativePlace: "Faridabad", profession: "Designer" },
    { id: 10, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "110", surname: "Gupta", name: "Karan", gothram: "Kashyap", dateOfBirth: "1994-06-14", age: 30, whatsapp: "9123487654", email: "karan.gupta@gmail.com", country: "India", state: "Uttar Pradesh", district: "Lucknow", mandal: "Hazratganj", address: "22, Old Town", nativePlace: "Varanasi", profession: "Lawyer" },
    { id: 11, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "111", surname: "Jain", name: "Aarti", gothram: "Agasthya", dateOfBirth: "1982-08-04", age: 42, whatsapp: "9087654321", email: "aarti.jain@gmail.com", country: "India", state: "Maharashtra", district: "Pune", mandal: "Baner", address: "5, Blossom Garden", nativePlace: "Mumbai", profession: "Writer" },
    { id: 12, photo: "/assets/download.png", aadharCard: "Aadhar", membershipID: "112", surname: "Sinha", name: "Anil", gothram: "Angiras", dateOfBirth: "1987-10-29", age: 37, whatsapp: "9765432109", email: "anil.sinha@gmail.com", country: "India", state: "Bihar", district: "Patna", mandal: "Boring Road", address: "33, Ganga View", nativePlace: "Gaya", profession: "Engineer" },
];


export default function UserList() {
    const [data, setData] = useState(initialData);

    const handleDeleteClick = (id) => {
        setData((prevData) => prevData.filter((row) => row.id !== id));
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Data");
        XLSX.writeFile(workbook, "user_data.xlsx");
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const columns = [
            "ID", "Aadhar Card", "Membership ID", "Surname", "Name", "Gothram",
            "Date of Birth", "Age", "WhatsApp", "Email", "Country", "State",
            "District", "Mandal", "Address", "Native Place", "Profession"
        ];
        const rows = data.map((row) => [
            row.id, row.aadharCard, row.membershipID, row.surname, row.name, row.gothram,
            row.dateOfBirth, row.age, row.whatsapp, row.email, row.country,
            row.state, row.district, row.mandal, row.address, row.nativePlace,
            row.profession
        ]);

        doc.autoTable({ head: [columns], body: rows });
        doc.save("user_data.pdf");
    };

    const columns = [
        { field: 'photo', headerName: 'Photo', width: 100, cellClassName: 'center-align', renderCell: (params) => (<img src={params.value} alt="profile" width="50" height="50" />) },
        {
            field: 'aadharCard',
            headerName: 'Aadhar Card',
            width: 130,
            cellClassName: 'center-align',
            renderCell: (params) => (
                <a
                    href={`/path-to-aadhar-cards/${params.row.membershipID}.pdf`}  // Adjust the URL based on your setup
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {params.value}
                </a>
            ),
        },
        { field: 'membershipID', headerName: 'Membership ID', width: 130, editable: true, cellClassName: 'center-align' },
        { field: 'surname', headerName: 'Surname', width: 130, editable: true, cellClassName: 'center-align' },
        { field: 'name', headerName: 'Name', width: 130, editable: true, cellClassName: 'center-align' },
        { field: 'gothram', headerName: 'Gothram', width: 130, editable: true, cellClassName: 'center-align' },
        { field: 'dateOfBirth', headerName: 'Date of Birth', width: 130, editable: true, cellClassName: 'center-align' },
        { field: 'age', headerName: 'Age', type: 'number', width: 90, editable: true, cellClassName: 'center-align' },
        { field: 'email', headerName: 'Email', width: 180, editable: true, cellClassName: 'center-align' },
        { field: 'country', headerName: 'Country', width: 180, editable: true, cellClassName: 'center-align' },
        { field: 'state', headerName: 'State', width: 180, editable: true, cellClassName: 'center-align' },
        { field: 'district', headerName: 'District', width: 180, editable: true, cellClassName: 'center-align' },
        { field: 'address', headerName: 'Address', width: 180, editable: true, cellClassName: 'center-align' },
        { field: 'nativePlace', headerName: 'Native Place', width: 180, editable: true, cellClassName: 'center-align' },
        { field: 'profession', headerName: 'Profession', width: 180, editable: true, cellClassName: 'center-align' },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            getActions: (params) => [
                <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={() => handleDeleteClick(params.id)} />,
            ],
        },
    ];

    return (
        <>
            <Navbar />
            <div className='user-list'>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <div className='title'>User List</div>
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={exportToExcel}
                            style={{ marginRight: '10px' }}
                            startIcon={<DownloadIcon />}
                        >
                            Export to Excel
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={exportToPDF}
                            startIcon={<PictureAsPdfIcon />}
                        >
                            Export to PDF
                        </Button>
                    </div>
                </Box>
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={data}
                        columns={columns}
                        pageSize={5}
                        rowsPerPageOptions={[2, 5, 10]}
                        disableSelectionOnClick
                        sx={{ border: 0 }}
                        getRowHeight={() => 'auto'}
                    />
                </Paper>
            </div>
            <FooterComp />
        </>
    );
}
