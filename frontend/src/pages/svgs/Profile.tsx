// This component returns an SVG icon representing a user profile (typically used as an avatar or account icon)
const Profile = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" // XML namespace for SVG
        className="w-6 h-6"               // Tailwind CSS classes to set width and height
        fill="none"                       // No fill color inside shapes
        viewBox="0 0 24 24"               // Viewbox dimensions (standard for icons)
        stroke="currentColor"            // Stroke (outline) color follows current text color
    >
        <path
            strokeLinecap="round"         // Rounded ends for the stroke
            strokeLinejoin="round"        // Rounded corners where paths meet
            strokeWidth={2}               // Thickness of the stroke
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            // First part draws a circular head (profile picture)
            // Second part draws a curved base (shoulders/torso)
        />
    </svg>
);

// Export the Profile component for use in other parts of the app
export default Profile;
