type NavbarProps = {
    twoCameraMode: boolean;
    onToggleCameraMode: () => void;
};

export const Navbar =  ({ twoCameraMode, onToggleCameraMode }: NavbarProps) => {
    return (
        <header className="navbar">
            <button className="toggle-button" onClick={onToggleCameraMode}>
                {twoCameraMode ? "Toggle 2 Images → 1 Image" : "Toggle 1 Image → 2 Images"}
            </button>

            <img className="navbar-logo" src="/logo.png" alt="PIA Automation logo" />
        </header>
    );
}