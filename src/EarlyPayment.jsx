// EarlyPaymentTool.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import Select from "react-select";


export default function EarlyPaymentTool() {

    const [env, setEnv] = useState("staging");
    const [partner, setPartner] = useState("Aramco");
    const [token, setToken] = useState("");
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // User inputs
    const [count, setCount] = useState(1);
    const [currencies, setCurrencies] = useState(["SAR"]); // array, not string
    const [buyer, setBuyer] = useState("Aramco");
    const [vendorCr, setVendorCr] = useState("");
    const [sequenceNumber, setSequenceNumber] = useState(100001);

    const BASE_URL =
        env === "sandbox"
            ? "https://sandbox-developer.manafa.sa"
            : `https://oci-${env}-financing-partners.manafatech.com`;

    const API_BASE = ["staging", "release", "sandbox", "prelive", "dev", "uat"].reduce((acc, env) => {
        acc[env] = BASE_URL.replace("{{env}}", env);
        return acc;
    }, {});

    // Replace with actual values
    const partnerCreds = {
        // ARAMCO: { client_id: "{{aramco_client_id}}", client_secret: "{{aramco_client_secret}}" },
        ...(env === "prelive" ? {
            ARAMCO: { client_id: "taulia1741264205", client_secret: "bshP0Fxd4RkZ0u7hwb1GMC1U7M1omDan275NnX5VU0SPFwdqlXdhjclLMVOQPGCxJ" },
        } : env === "sandbox" ? {
            ARAMCO: { client_id: "taulia1736242496", client_secret: "85i4V7i2d4JC0huhAUeKUZ9Z9OFpjgZicxF5P1hGaCxLXhsZOwsiQHFY5OUZo08VJ" },
        } : {
            // ARAMCO: { client_id: "Aramco1738829529", client_secret: "y6r1MgzL84IHcwdYtIlM07VHQj28aXkUcDQjWkFr2228ofvnnANz5l52wKcaAyjeH" },
            ARAMCO: { client_id: "Aramco1742640824", client_secret: "HFjOGCrXIH93K9anRTl0sFG05lrS9EBoocX93sK3JemXQppYM9Mow27jfHH9yoKpQ" },
        }
        ),
        SEC: { client_id: "{{sec_client_id}}", client_secret: "{{sec_client_secret}}" },
        BRKZ: { client_id: "BRKZ1742023860", client_secret: "HSkwoiVVjoFWoB1cyZAHLotmy8THDF43DRVzEjEIOivFYJxuxLDQnnNqpUQKZijBg" },
        MOXEY: { client_id: "MOXEY1739367226", client_secret: "3NJ1Yesj67C4PRGoirFeqVy0N1JOtDKCZdosEMdW3NaZgUxPx2b9cn2JpT3J9ScwF" },
        Mudad: { client_id: "MUDAD1735282189", client_secret: "ZShgv2NbwGHW5KIKhHbCMKGbKms6PII1tfFConTBbfzMJuuMbYYE5eDzZSd44vsMo" },
        Fasah: { client_id: "Fasah1735282189", client_secret: "gzosoNLK7OGxC2DwCGxZ9fPFjkiUmk6aQN8griyzGX7kzQVc6s8HDEQJhAZzhHqvu" },
    };

    const buyers = {
        ...(env === "sandbox"
            ? {
                Aramco: { name: "Aramco", number: "3000" },
                SEC: { name: "saudi electricity company", number: "3100" },
            }
            : {
                Aramco: { name: "Aramco", number: "1000" },
                SEC: { name: "saudi electricity company", number: "2001" },
            }),
    };

    // Helpers
    const log = (msg) => setLogs((prev) => [...prev, msg]);
    const randomFutureDate = (min = 1, max = 90) => {
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(Math.random() * (max - min + 1) + min));
        return d.toISOString().split("T")[0];
    };

    const randomPastDate = (max = 365) => {
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * max + 1));
        return d.toISOString().split("T")[0];
    };

    const getRandomLetters = (length = 5) => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        return result;
    };

    function generateDocuments(requestId, currency) {
        const patterns = [
            [1, 1], [1, 0], [2, 0], [2, 1], [2, 2],
            [3, 0], [3, 1], [3, 2], [3, 3],
            [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]
        ];
        const [invoiceCount, creditCount] = patterns[Math.floor(Math.random() * patterns.length)];
        const docs = [];

        // ===== Generate invoices with increasing amounts =====
        let baseAmount = +(Math.random() * (1000 - 100) + 100).toFixed(2);
        const increment = +(Math.random() * 2000 + 500).toFixed(2);
        for (let i = 0; i < invoiceCount; i++) {
            const amount = +(baseAmount + i * increment).toFixed(2);
            docs.push({
                number: `${requestId}-inv${i + 1}`,
                type: "INVOICE",
                amount,
                creationDate: randomPastDate(),
                dueDate: randomFutureDate(6, 90),
                currency,
            });
        }

        // ===== Generate credit notes =====
        for (let i = 0; i < creditCount; i++) {
            const invoiceAmounts = docs.filter(d => d.type === "INVOICE").map(d => d.amount);
            const minInv = invoiceAmounts.length ? Math.min(...invoiceAmounts) : 1000;
            const amount = +(Math.random() * (minInv - 100 - 500) + 500).toFixed(2);
            docs.push({
                number: `${requestId}-credit${i + 1}`,
                type: "CREDIT_NOTE",
                amount,
                creationDate: randomPastDate(),
                dueDate: randomFutureDate(6, 90),
                currency,
            });
        }

        // ===== Append credit note count to the highest invoice =====
        if (invoiceCount > 0) {
            // Find index of highest amount invoice in docs array
            let highestIdx = 0;
            let highestAmount = 0;
            docs.forEach((doc, idx) => {
                if (doc.type === "INVOICE" && doc.amount > highestAmount) {
                    highestAmount = doc.amount;
                    highestIdx = idx;
                }
            });

            // Append credit count to that invoice number
            docs[highestIdx].number = `${requestId}-inv${highestIdx + 1}-credit${creditCount}`;
        }

        return docs;
    }

    // Token Generator
    async function generateToken() {
        setLoading(true);
        log(`⚡ Generating token for ${partner} on ${env}...`);

        try {
            const res = await fetch(`${API_BASE[env]}/api/v1/embedded-financing/auth`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "x-trace-id": uuidv4(),
                },
                body: JSON.stringify(partnerCreds[partner.toUpperCase()]),
            });
            const data = await res.json();
            if (res.ok && data.token && res.status == 200) {
                setToken(data.token);
                log(`✅ Token generated for ${partner}, expires at ${data.expiresAt}`);
                log("------------------------------------------------------------------------------------------------")
            } else {
                setToken('');
                log(`❌ Token error: ${JSON.stringify(data)}`);
            }
        } catch (err) {
            setToken('');
            log(`❌ Token fetch failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }
    async function sendEarlyPayments() {
        setSending(true);
        if (!token) {
            log("❌ No token. Please generate token first");
            return;
        }

        let requestIdCounter = sequenceNumber;
        let allSucceeded = true;

        const randomSuffix = getRandomLetters(Math.floor(Math.random() * 5) + 1); // 1 to 5 letters
        const batchId = `batch-${buyer}-${requestIdCounter}${randomSuffix}-${Date.now()}`; // ONE batch
        const timestamp = new Date().toISOString();
        const earlyPaymentRequests = []; // 🟢 COLLECT ALL REQUESTS HERE

        for (const currency of currencies) {
            for (let i = 0; i < count; i++) {
                const currentId = requestIdCounter++;
                const alphaSuffix = getRandomLetters(Math.floor(Math.random() * 5) + 1);
                const requestId = `req-${buyer}-${currentId}${alphaSuffix}`;
                const docs = generateDocuments(requestId, currency);
                const invoiceSum = docs.filter(d => d.type === "INVOICE").reduce((s, d) => s + d.amount, 0);
                const creditSum = docs.filter(d => d.type === "CREDIT_NOTE").reduce((s, d) => s + d.amount, 0);
                let paymentAmount = +(invoiceSum - creditSum).toFixed(2);
                if (paymentAmount <= 0) paymentAmount = +(invoiceSum * 0.9).toFixed(2);

                // 🟢 ADD each request to array (no API call here)
                earlyPaymentRequests.push({
                    requestId,
                    buyerName: buyers[buyer]?.name || "aramco",
                    buyerNumber: buyers[buyer]?.number || "1000",
                    funderName: "Manafa",
                    vendorName: "Iron Mine LLC",
                    vendorNumber: "Supplier1",
                    vendorCrNumber: vendorCr,
                    vendorGosiNumber: "1111111111",
                    vendorGosiNumberExpiryDate: randomFutureDate(1, 365),
                    vendorZatcaNumber: "num123",
                    vendorZatcaExpiryDate: randomFutureDate(1, 365),
                    vendorBankDetails: {
                        bankName: "Alrajhi Bank",
                        accountNumber: "112618010297476",
                        swift: "RJHISARI",
                        iban: "SA0245735332721632529663",
                        bankCurrency: currency,
                    },
                    requestDate: randomPastDate(),
                    paymentDate: randomFutureDate(6, 90),
                    adjustedDueDate: randomFutureDate(1, 90),
                    paymentAmount,
                    certifiedAmount: paymentAmount,
                    discountAmount: +(paymentAmount * 0.1).toFixed(2),
                    providerMarginRate: 0.002,
                    providerMarginAmount: +(paymentAmount * 0.002).toFixed(3),
                    funderMarginRate: 0.003,
                    funderMarginAmount: +(paymentAmount * 0.003).toFixed(3),
                    flatFee: 1234.56,
                    rate: {
                        tenor: 68,
                        spread: 3.0,
                        discountRate: 7.6917,
                        referenceRateType: "SAIBOR",
                        referenceRateBand: "1M",
                    },
                    documents: docs,
                });
            }
        }

        // ---------------------------
        // 🟢 ONE FINAL API CALL — ONE BATCH
        // ---------------------------
        const payload = {
            batchId,
            timestamp,
            earlyPaymentRequests
        };

        try {
            const res = await fetch(`${API_BASE[env]}/api/v1/embedded-financing/fund-requests/supply-chain`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "x-trace-id": uuidv4(),
                    "x-timestamp": Date.now().toString(),
                    "x-language": "en",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.status == 200) {
                log(`✅ Batch sent successfully: ${batchId}`);
                log(`📦 Total early payments: ${earlyPaymentRequests.length}`);
            } else {
                log(`❌ API failed: ${JSON.stringify(data, null, 2)}`);
            }
        } catch (err) {
            log(`❌ API failed: ${err.message}`);
            allSucceeded = false;
        }

        setSequenceNumber(requestIdCounter);
        setSending(false);
    }

    // UI
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div style={{ maxWidth: "900px", width: "100%", marginLeft: "320px" }}>
                {/* Form */}
                <div className="card border-dark mb-3">
                    <div className="card-body">
                        <h2 className="card-title text-center mb-4">Early Payment</h2>
                        {/* First Row: Env + Partner */}
                        <div className="row g-3 mb-3">
                            {/* Env */}
                            <div className="col-md-6">
                                <label className="form-label">Env:</label>
                                <Select
                                    value={{ label: env, value: env }}
                                    onChange={(selected) => setEnv(selected.value)}
                                    options={Object.keys(API_BASE).map((e) => ({ label: e, value: e }))}
                                    isSearchable
                                    className="basic-single"
                                />
                            </div>

                            {/* Partner */}
                            <div className="col-md-6">
                                <label className="form-label">Partner:</label>
                                <Select
                                    value={{ label: partner, value: partner }}
                                    onChange={(selected) => setPartner(selected.value)}
                                    options={Object.keys(partnerCreds).map((i) => ({ label: i, value: i }))}
                                    isSearchable
                                    className="basic-single"
                                />
                            </div>
                        </div>

                        {/* Second Row: Buyer + Count + Currencies + Vendor CR + Sequence Number */}
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label">Buyer:</label>
                                <select className="form-select" value={buyer} onChange={(e) => setBuyer(e.target.value)}>
                                    {Object.keys(buyers).map((b) => (
                                        <option key={b} value={b}>{buyers[b].name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Vendor CR:</label>
                                <input type="text" className="form-control" placeholder="CR Number" value={vendorCr} onChange={(e) => setVendorCr(e.target.value)} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Sequence:</label>
                                <input type="number" className="form-control" placeholder="Sequence Number" value={sequenceNumber} onChange={(e) => setSequenceNumber(Number(e.target.value))} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Count:</label>
                                <input type="number" className="form-control" placeholder="Invoice Count" value={count} onChange={(e) => setCount(Number(e.target.value))} />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Currencies:</label>
                                <div className="d-flex gap-2">
                                    {["SAR", "USD"].map((cur) => (
                                        <div className="form-check" key={cur}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                value={cur}
                                                id={`currency-${cur}`}
                                                checked={currencies.includes(cur)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setCurrencies([...currencies, cur]);
                                                    } else if (currencies.length > 1) {
                                                        setCurrencies(currencies.filter((c) => c !== cur));
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`currency-${cur}`}>{cur}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <button className="btn btn-primary" onClick={generateToken} disabled={loading}>
                                {loading ? "Generating..." : "Generate Token"}
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => {
                                    setLogs([]);           // first clear logs
                                    sendEarlyPayments();    // then call your function
                                }} disabled = {sending}
                            >  {sending ? "Sending EP's..." : "Send EP Requests"}
                            </button>
                           
                            <button className="btn btn-danger" onClick={() => setLogs([])}>
                                Clear Logs
                            </button>
                            {/* <Link to="/time-calculator">
                                <button className="btn btn-warning rounded-xl px-4 py-2 shadow">
                                    Go to Time Calculator
                                </button>
                            </Link> */}
                        </div>
                    </div>
                </div>

                {/* Logs */}
                <div className="card border-dark" style={{ height: "300px", overflowY: "scroll", backgroundColor: "#000" }}>
                    <div className="card-body text-success font-monospace p-3">
                        <div className="text-secondary">Mudassir Afzal</div>
                        {logs.length === 0 ? (
                            <div className="text-secondary">No logs yet...</div>
                        ) : (
                            [...logs].reverse().map((log, i) => {
                                if (typeof log === "string") return <div key={i}>{log}</div>;
                                if (typeof log === "object") return <pre key={i}>{JSON.stringify(log, null, 2)}</pre>;
                                return null;
                            })
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}