type NavbarProps = {
    twoCameraMode: boolean;
    onToggleCameraMode: () => void;
};

export const Navbar = ({ twoCameraMode, onToggleCameraMode }: NavbarProps)=> {
    return (
        <header className="navbar">
            <div className="camera-toggle-wrapper">
                <span className={!twoCameraMode ? "toggle-label active" : "toggle-label"}>
                    1 Camera
                </span>

                <button
                    className={twoCameraMode ? "apple-toggle active" : "apple-toggle"}
                    onClick={onToggleCameraMode}
                    aria-label="Toggle camera mode"
                >
                    <span className="apple-toggle-knob"></span>
                </button>

                <span className={twoCameraMode ? "toggle-label active" : "toggle-label"}>
                    2 Cameras
                </span>
            </div>

            <img className="navbar-logo" src="/logo.svg" alt="PIA Automation logo" />
        </header>
    );
}