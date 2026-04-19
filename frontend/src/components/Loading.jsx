import React from "react";
import PropTypes from "prop-types";

const Loading = ({ size = 40, text = "Loading...", inline = false }) => {
    const containerStyle = inline
        ? { display: "inline-flex", alignItems: "center", gap: 8 }
        : { display: "flex", alignItems: "center", gap: 12, justifyContent: "center" };

    return (
        <>
            <style>{`
                .loading-spinner {
                    animation: loading-spin 1s linear infinite;
                    transform-origin: center;
                }
                @keyframes loading-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loading-text {
                    font-size: 0.95rem;
                    color: #333;
                }
                .visually-hidden {
                    position: absolute !important;
                    height: 1px; width: 1px;
                    overflow: hidden;
                    clip: rect(1px, 1px, 1px, 1px);
                    white-space: nowrap; /* added line */
                }
            `}</style>

            <div role="status" aria-live="polite" className ="h-full w-full z-41  fixed bg-black/50 dark:bg-white/20" style={containerStyle}>
                <svg
                    className="loading-spinner"
                    width={size}
                    height={size}
                    viewBox="0 0 50 50"
                    aria-hidden="true"
                    focusable="false"
                >
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="#e6e6e6"
                        strokeWidth="6"
                    />
                    <path
                        d="M45 25a20 20 0 0 1-20 20"
                        fill="none"
                        stroke="#1976d2"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                </svg>

                {text ? <span className="loading-text">{text}</span> : null}
                <span className="visually-hidden">{text}</span>
            </div>
        </>
    );
};

Loading.propTypes = {
    size: PropTypes.number,
    text: PropTypes.string,
    inline: PropTypes.bool,
};

export default Loading;