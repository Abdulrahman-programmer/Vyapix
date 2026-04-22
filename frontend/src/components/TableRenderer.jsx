// REMOVED: import { object } from "prop-types"; — unused import

const formatString = (str) => {
    if (!str) return "";
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (s) => s.toUpperCase());
};

const formatDate = (date) => {
    return date ? date.split("T")[0] : "";
};

export const renderTable = (data, type) => {
    if (!data || data.length === 0) {
        return <p>No data available</p>;
    }

    // FIX: avoid mutating the parameter — use a local variable instead
    let resolvedData = data;

    if (type === "dailyProfit" || type === "expiring") {
        resolvedData = data.data;
    }

    if (type === "salesSummary") {
        return (
            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-200">
                        {Object.keys(resolvedData).map((key) => (
                            <th key={key} className="py-2 px-4 border-b bg-gray-200 text-left">
                                {formatString(key)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {Object.values(resolvedData).map((value, index) => (
                            <td key={index} className="py-2 px-4 border-b">
                                {value}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        );
    } else if (type === "profitRange" || type === "dailyProfit") {
        // FIX: typo "produts" → "products"; fallback to [] instead of [{}]
        const products = resolvedData.products || [];

        // FIX: guard against empty products array before accessing [0]
        if (products.length === 0) return <p>No product data available</p>;

        return (
            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-200">
                        {Object.keys(products[0]).map((key) => (
                            <th key={key} className="py-2 px-4 border-b bg-gray-200 text-left">
                                {formatString(key)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            {Object.values(product).map((value, subIndex) => (
                                <td key={subIndex} className="py-2 px-4 border-b">
                                    {typeof value === "number" ? value.toFixed(2) : value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    } else if (type === "stockValue") {
        // FIX: use resolvedData.data instead of reassigning the parameter
        const stockData = resolvedData.data;
        return (
            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-200">
                        {Object.keys(stockData).map((key) => (
                            <th key={key} className="py-2 px-4 border-b bg-gray-200 text-left">
                                {formatString(key)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr key={0}>
                        {Object.values(stockData).map((value, index) => (
                            <td className="py-2 px-4 border-b" key={index}>
                                {typeof value === "number" ? value.toFixed(2) : value}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        );
    } else if (type === "expiring") {
        const alreadyExpired = resolvedData.alreadyExpired || [];
        const expiringSoon = resolvedData.expiringSoon || [];
        return (
            <div>
                <h2 className="text-2xl font-bold mb-4">Already Expired</h2>
                {alreadyExpired.length > 0 ? (
                    <table className="min-w-full bg-white border mb-8">
                        <thead>
                            <tr className="bg-gray-200">
                                {/* FIX: added consistent className to th elements */}
                                <th className="py-2 px-4 border-b text-left">Product Name</th>
                                <th className="py-2 px-4 border-b text-left">Category</th>
                                <th className="py-2 px-4 border-b text-left">Quantity</th>
                                <th className="py-2 px-4 border-b text-left">Expiration Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alreadyExpired.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b text-center">{item.name}</td>
                                    <td className="py-2 px-4 border-b text-center">{item.category}</td>
                                    <td className="py-2 px-4 border-b text-center">{item.quantity}</td>
                                    <td className="py-2 px-4 border-b text-center">{formatDate(item.expiryDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No already expired products.</p>
                )}

                <h2 className="text-2xl font-bold mb-4">Expiring Soon</h2>
                {expiringSoon.length > 0 ? (
                    <table className="min-w-full bg-white border">
                        <thead>
                            <tr className="bg-gray-200">
                                {/* FIX: added consistent className to th elements */}
                                <th className="py-2 px-4 border-b text-left">Product Name</th>
                                <th className="py-2 px-4 border-b text-left">Category</th>
                                <th className="py-2 px-4 border-b text-left">Quantity</th>
                                <th className="py-2 px-4 border-b text-left">Expiration Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expiringSoon.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2 px-4 border-b">{item.name}</td>
                                    <td className="py-2 px-4 border-b">{item.category}</td>
                                    <td className="py-2 px-4 border-b">{item.quantity}</td>
                                    <td className="py-2 px-4 border-b">{formatDate(item.expiryDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No products expiring soon.</p>
                )}
            </div>
        );
    } else {
        return (
            <table className="min-w-full bg-white border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-2 px-4 border-b bg-gray-200 text-left">Rank</th>
                        <th className="py-2 px-4 border-b bg-gray-200 text-left">Product Name</th>
                        <th className="py-2 px-4 border-b bg-gray-200 text-left">Profit per Unit</th>
                        <th className="py-2 px-4 border-b bg-gray-200 text-left">Quantity Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {resolvedData.map((item, index) => (
                        <tr key={index}>
                            <td className="py-2 px-4 border-b">{index + 1}</td>
                            <td className="py-2 px-4 border-b">{item.productName}</td>
                            <td className="py-2 px-4 border-b">{item.profitPerUnit.toFixed(2)}</td>
                            <td className="py-2 px-4 border-b">{item.totalQuantitySold}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
};