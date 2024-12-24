import React, { useState, useEffect } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import FooterComp from '../../Components/FooterComp/FooterComp';
import { userService } from '../../service';
import './Home.css';

const Home = () => {
    const [registrations, setRegistrations] = useState({ total: 0, countries: {} });

    const userList = {};

    useEffect(() => {
        const fetchData = async () => {
            const response = await userService.getAllUsers();
            const users = response.data;
            const totalUsers = response.metadata.totalUsers;

            const countriesCount = {};
            users.forEach(user => {
                const country = user.country;
                countriesCount[country] = (countriesCount[country] || 0) + 1;
            });

            setRegistrations({ total: totalUsers, countries: countriesCount });
        };
        fetchData();
    }, []);

    return (
        <div className='home-page'>
            <Navbar />
            <div className="container">
                <h1>Total Registrations: {registrations.total}</h1>
                <h2>Country-wise Registration Count:</h2>
                <div className="cards-container">
                    {registrations.countries &&
                        Object.entries(registrations.countries).map(([country, count]) => (
                            <div className="card" key={country}>
                                <h3>{country}</h3>
                                <p>Registrations: {count}</p>
                                <ul>
                                    {userList[country]
                                        ? userList[country].map((user, index) => (
                                            <li key={index}>{user}</li>
                                        ))
                                        : null}
                                </ul>
                            </div>
                        ))}
                </div>
            </div>
            <FooterComp />
        </div>
    );
};

export default Home;
