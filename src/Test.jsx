import React, { useState, useEffect } from "react";

export default function Test() {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetch("https://api.kuchizu.online/masters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "John Doe", email: "john@example.com" })
        })
            .then(res => res.json())
            .then(data => {
                setClients([data]);
                console.log(data);
            })
            .catch(console.error);
    }, []);

    return (
        <div>
            <h1>Clients</h1>
            <ul>
                {clients.map((client, index) => (
                    <li key={index}>{client.name}</li>
                ))}
            </ul>
        </div>
    );
}
