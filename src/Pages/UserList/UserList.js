import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { DataGrid, GridActionsCellItem, GridToolbarQuickFilter, GridToolbarContainer, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Paper, Button, Box, Dialog, DialogContent, Typography, IconButton } from '@mui/material';
import { Download as DownloadIcon, PictureAsPdf as PictureAsPdfIcon, Visibility as ViewIcon, Close as CloseIcon } from '@mui/icons-material';
import Navbar from '../../Components/Navbar/Navbar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './UserList.css';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { userService } from '../../service';
import { TailSpin } from 'react-loader-spinner';
import html2pdf from 'html2pdf.js';
import CardFront from '../IDCard/IDCard';
import { toast } from 'react-toastify';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export default function UserList() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filteredRows, setFilteredRows] = useState([]);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [openCardDialog, setopenCardDialog] = useState(false);
    const [cardDetails, setCardDetails] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedUserData, setSelectedUserData] = useState(null);

    const getAllUsersData = useCallback(async () => {
        setError('');
        setLoading(true);

        try {
            const response = await userService.getAllUsers(page, rowsPerPage);
            setData(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Something went wrong, please try again later');
            toast.error('Failed to load user data');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage]);

    useEffect(() => {
        getAllUsersData();
    }, [getAllUsersData]);

    // Memoize data transformation
    const processedData = useMemo(() =>
        data.map(user => ({
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
        })), [data]);

    const handleImageClick = (imageUrl, rowData) => {
        setSelectedImage(imageUrl);
        setSelectedUserData(rowData);
        setOpenImageDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenImageDialog(false);
        setopenCardDialog(false);
        setSelectedImage(null);
        setSelectedUserData(null);
    };

    const exportToExcel = () => {
        const dataToExport = filteredRows.length > 0 ? filteredRows : processedData;

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
        const dataToExport = filteredRows.length > 0 ? filteredRows : processedData;

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

    // const handleDownloadPdf = async (userData) => {
    //     alert()
    //     try {
    //         const response = await downloadUserPdf(userData.id);
    //         const blob = new Blob([response], { type: 'application/pdf' });
    //         const url = window.URL.createObjectURL(blob);
    //         window.open(url, '_blank');
    //         toast.success('PDF opened successfully!');
    //     } catch (error) {
    //         console.error('Error opening PDF:', error);
    //         toast.error(error.message || 'Failed to open PDF');
    //     }
    // };

    const cardRef = useRef(null);

    const downloadPDF = (userData) => {
        const element = cardRef.current;
        const options = {
            margin: 0,
            filename: "ID_card.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };
        html2pdf().set(options).from(element).save();
    };

    const handleViewCard = (userData) => {
        setCardDetails(userData);
        setopenCardDialog(true);
    };

    const columns = [
        {
            field: 'photo',
            headerName: 'Photo',
            width: 100,
            renderCell: (params) => (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleImageClick(params.value, params.row)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleImageClick(params.value, params.row);
                        }
                    }}
                >
                    <img
                        src={params.value}
                        alt="profile"
                        width="60"
                        height="60"
                        style={{ cursor: 'pointer', objectFit: 'cover', borderRadius: '50%' }}
                    />
                </div>
            )
        },
        { field: 'surname', headerName: 'Surname', width: 113, cellClassName: 'vertical-center' },
        { field: 'name', headerName: 'Name', width: 113, cellClassName: 'vertical-center' },
        { field: 'gothram', headerName: 'Gothram', width: 113, cellClassName: 'vertical-center' },
        { field: 'mobile', headerName: 'Mobile', width: 113, cellClassName: 'vertical-center' },
        { field: 'dob', headerName: 'Date of Birth', width: 113, cellClassName: 'vertical-center' },
        { field: 'gender', headerName: 'Gender', width: 113, cellClassName: 'vertical-center' },
        { field: 'residentType', headerName: 'Resident Type', width: 113, cellClassName: 'vertical-center' },
        { field: 'state', headerName: 'State', width: 113, cellClassName: 'vertical-center' },
        { field: 'city', headerName: 'City', width: 113, cellClassName: 'vertical-center' },
        { field: 'country', headerName: 'Country', width: 113, cellClassName: 'vertical-center' },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'View ID Card',
            width: 150,
            getActions: (params) => [
                <GridActionsCellItem
                    key={`view-${params.row.id}`}
                    icon={<ViewIcon />}
                    label="View Card"
                    onClick={() => handleViewCard(params.row)}
                />,
                // <GridActionsCellItem
                //     key={`download-pdf-${params.row.id}`}
                //     icon={<DownloadIcon />}
                //     label="Download PDF"
                //     onClick={() => handleDownloadPdf(params.row)}
                // />

            ],
        },
    ];

    function CustomToolbar() {
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        return (
            <GridToolbarContainer 
                sx={{ 
                    justifyContent: 'flex-end', 
                    flexWrap: 'nowrap', 
                    overflowX: 'auto', 
                    padding: '0 10px',
                    gap: 1 // Add small gap between items
                }}
            >
                <GridToolbarFilterButton />
                <GridToolbarQuickFilter 
                    sx={{ 
                        minWidth: isMobile ? 100 : 'auto', 
                        flexGrow: isMobile ? 1 : 0 
                    }} 
                />
                <Button
                    variant="text"
                    onClick={exportToExcel}
                    startIcon={<DownloadIcon />}
                    sx={{ 
                        mr: 1, 
                        minWidth: isMobile ? 'auto' : undefined,
                        padding: isMobile ? '6px 8px' : undefined
                    }}
                >
                    {!isMobile && 'Export Excel'}
                </Button>
                <Button
                    variant="text"
                    onClick={exportToPDF}
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ 
                        minWidth: isMobile ? 'auto' : undefined,
                        padding: isMobile ? '6px 8px' : undefined
                    }}
                >
                    {!isMobile && 'Export PDF'}
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
                            rows={processedData}
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
                                    setFilteredRows(processedData);
                                    return;
                                }

                                const filtered = processedData.filter(row => {
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
                    open={openCardDialog}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleCloseDialog}
                            aria-label="close"
                            style={{ position: 'absolute', right: 20, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <div className="dialog-content-container" ref={cardRef} style={{ padding: '20px' }}>
                            <CardFront cardDetails={cardDetails} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <Button
                                variant="contained"
                                onClick={() => downloadPDF(cardDetails)}
                                style={{ backgroundColor: '#3f51b5', color: '#fff' }}
                            >
                                Download ID Card
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={openImageDialog}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogContent>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleCloseDialog}
                            aria-label="close"
                            style={{ position: 'absolute', right: 20, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
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
