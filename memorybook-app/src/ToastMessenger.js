import { useState, useEffect } from "react";

export const ToastMessenger = ({ message }) => {
    const TIMEOUT = 3000;

    const [text, setText] = useState("");

    useEffect(() => {
        setText(message);
        const timeout = setTimeout(hide, TIMEOUT);

        // Cleanup
        return () => {
            clearTimeout(timeout);
        };
    }, [TIMEOUT, message]);

    function hide() {
        setText("");
    }

    return (
        <div style={{ visibility: text != ""? "visible": "hidden"}} className="toast">
            <p>{text}</p>
        </div>
    );
};
