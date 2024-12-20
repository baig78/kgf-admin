import React, { useEffect, useState, useCallback } from 'react';
import { DataGrid, GridActionsCellItem, GridToolbarQuickFilter, GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Paper, Button, Box, Dialog, DialogContent, Typography } from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon, PictureAsPdf as PictureAsPdfIcon } from '@mui/icons-material';
import Navbar from '../../Components/Navbar/Navbar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './UserList.css';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { userService } from '../../service';
import { TailSpin } from 'react-loader-spinner';

export default function UserList() {

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedUserData, setSelectedUserData] = useState(null);
    const [openImageDialog, setOpenImageDialog] = useState(false);

    // Fetch user data from API
    const getAllUsersData = useCallback(async () => {
        setError(''); // Clear previous errors
        setLoading(true); // Show loading state

        try {
            const response = await userService.getAllUsers(page, rowsPerPage);
            // Handle successful response
            const usersData = response.data.map(user => ({
                id: user._id,
                photo: user.photo,
                surname: user.surname,
                name: user.name,
                gothram: user.gothram,
                mobile: user.mobile,
                dob: user.dob,
                gender: user.gender,
                residentType: user.residentType,
                state: user.state,
                city: user.city,
                country: user.country,
                address: user.address,
            }));
            setData(usersData); // Set data to state
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Something went wrong, please try again later');
        } finally {
            setLoading(false); // Stop loading state
        }
    }, [page, rowsPerPage]);

    useEffect(() => {
        getAllUsersData();
    }, [getAllUsersData]);

    const handleDeleteClick = (id) => {
        setData((prevData) => prevData.filter((row) => row.id !== id));
    };

    const handleImageClick = (imageUrl, rowData) => {
        setSelectedImage(imageUrl);
        setSelectedUserData(rowData);
        setOpenImageDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenImageDialog(false);
        setSelectedImage(null);
        setSelectedUserData(null);
    };

    const exportToExcel = () => {
        // Use filteredRows if there are any, otherwise use all data
        const dataToExport = filteredRows.length > 0 ? filteredRows : data;

        const formattedData = dataToExport.map((row) => ({
            ID: row.id,
            Surname: row.surname,
            Name: row.name,
            Gothram: row.gothram,
            Mobile: row.mobile,
            DOB: row.dob,
            Gender: row.gender,
            ResidentType: row.residentType,
            State: row.state,
            City: row.city,
            Country: row.country,
            Address: row.address,
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "User Data");
        XLSX.writeFile(workbook, "user_data.xlsx");
    };

    const exportToPDF = () => {
        // Use filteredRows if there are any, otherwise use all data
        const dataToExport = filteredRows.length > 0 ? filteredRows : data;

        const doc = new jsPDF();
        const columns = [
            "ID", "Surname", "Name", "Gothram", "Mobile", "Date of Birth",
            "Gender", "Resident Type", "State", "City", "Country", "Address"
        ];

        const rows = dataToExport.map((row) => [
            row.id, row.surname, row.name, row.gothram, row.mobile, row.dob,
            row.gender, row.residentType, row.state, row.city, row.country, row.address
        ]);

        doc.autoTable({ head: [columns], body: rows });
        doc.save("user_data.pdf");
    };

    const columns = [
        {
            field: 'photo',
            headerName: 'Photo',
            width: 100,
            renderCell: (params) => (
                <img
                    src={params.value}
                    alt="profile"
                    width="60"
                    height="60"
                    style={{ cursor: 'pointer', objectFit: 'cover', borderRadius: '50%' }}
                    onClick={() => handleImageClick(params.value, params.row)}
                />
            )
        },
        { field: 'surname', headerName: 'Surname', width: 130, cellClassName: 'vertical-center' },
        { field: 'name', headerName: 'Name', width: 130, cellClassName: 'vertical-center' },
        { field: 'gothram', headerName: 'Gothram', width: 130, cellClassName: 'vertical-center' },
        { field: 'mobile', headerName: 'Mobile', width: 130, cellClassName: 'vertical-center' },
        { field: 'dob', headerName: 'Date of Birth', width: 130, cellClassName: 'vertical-center' },
        { field: 'gender', headerName: 'Gender', width: 130, cellClassName: 'vertical-center' },
        { field: 'residentType', headerName: 'Resident Type', width: 130, cellClassName: 'vertical-center' },
        { field: 'state', headerName: 'State', width: 180, cellClassName: 'vertical-center' },
        { field: 'city', headerName: 'City', width: 180, cellClassName: 'vertical-center' },
        { field: 'country', headerName: 'Country', width: 180, cellClassName: 'vertical-center' },
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

    function CustomToolbar() {
        return (
            <GridToolbarContainer sx={{ justifyContent: 'flex-end' }}>
                <GridToolbarFilterButton />
                <GridToolbarQuickFilter />
                <Button
                    variant="text"
                    onClick={exportToExcel}
                    startIcon={<DownloadIcon />}
                    sx={{ mr: 1 }}
                >
                    Export Excel
                </Button>
                <Button
                    variant="text"
                    onClick={exportToPDF}
                    startIcon={<PictureAsPdfIcon />}
                >
                    Export PDF
                </Button>
            </GridToolbarContainer>
        );
    }

    return (
        <>
            <Navbar />
            <div className='user-list'>
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <div className='title'>User List</div>
                </Box>

                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <TailSpin color="#00BFFF" height={80} width={80} />
                    </div>
                )}
                {error && <div>{error}</div>}

                {!loading && !error && (
                    <Paper sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                            className="custom-data-grid"
                            rows={data}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 5, page: 0 },
                                },
                            }}
                            pageSizeOptions={[5, 10, 25]}
                            disableSelectionOnClick
                            sx={{ border: 0 }}
                            getRowHeight={() => 'auto'}
                            slots={{
                                toolbar: CustomToolbar,
                            }}
                            filterMode="client"
                            onFilterModelChange={(model) => {
                                if (!model.items || model.items.length === 0) {
                                    setFilteredRows(data);
                                    return;
                                }

                                const filtered = data.filter(row => {
                                    return model.items.every(filterItem => {
                                        const value = row[filterItem.field];
                                        const searchValue = filterItem.value;

                                        if (!value || !searchValue) return true;

                                        return String(value)
                                            .toLowerCase()
                                            .includes(String(searchValue).toLowerCase());
                                    });
                                });

                                setFilteredRows(filtered);
                            }}
                            componentsProps={{
                                toolbar: {
                                    showQuickFilter: true,
                                    quickFilterProps: { debounceMs: 500 },
                                },
                            }}
                            onPageChange={(newPage) => setPage(newPage + 1)}
                            onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
                        />
                    </Paper>
                )}

                <Dialog
                    open={openImageDialog}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent>
                        <div className="dialog-content-container">
                            {/* Image Section */}
                            <div className="dialog-image-container">
                                {selectedImage && (
                                    <img
                                        src={selectedImage}
                                        alt="User"
                                    />
                                )}
                            </div>

                            {/* User Details Section */}
                            <div className="dialog-details-container">
                                {selectedUserData && (
                                    <>
                                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            User Details
                                        </Typography>
                                        <Typography><strong>Name:</strong> {selectedUserData.name}</Typography>
                                        <Typography><strong>Surname:</strong> {selectedUserData.surname}</Typography>
                                        <Typography><strong>Gothram:</strong> {selectedUserData.gothram}</Typography>
                                        <Typography><strong>Mobile:</strong> {selectedUserData.mobile}</Typography>
                                        <Typography><strong>Date of Birth:</strong> {selectedUserData.dob}</Typography>
                                        <Typography><strong>Gender:</strong> {selectedUserData.gender}</Typography>
                                        <Typography><strong>Resident Type:</strong> {selectedUserData.residentType}</Typography>
                                        <Typography><strong>State:</strong> {selectedUserData.state}</Typography>
                                        <Typography><strong>City:</strong> {selectedUserData.city}</Typography>
                                        <Typography><strong>Country:</strong> {selectedUserData.country}</Typography>
                                        <Typography><strong>Address:</strong> {selectedUserData.address}</Typography>
                                    </>
                                )}
                            </div>
                        </div>
                    </DialogContent>

                </Dialog>

            </div>
            <FooterComp />
        </>
    );
}
