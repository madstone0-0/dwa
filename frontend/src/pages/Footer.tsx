// Footer component for reusability
const Footer: FC = () => (
    // This is the footer component that will be displayed at the bottom of the page.
    <footer
        className="py-5 text-xs text-center text-white border-t border-gray-300 bg-wine"
        style={{ backgroundColor: "#722F37" }}
    >
        <p className="mb-1">
            <span className="text-yellow-400 cursor-pointer hover:underline">Terms of Service</span> &nbsp; | &nbsp;
            <span className="text-yellow-400 cursor-pointer hover:underline">Privacy Policy</span> &nbsp; | &nbsp;
            <span className="text-yellow-400 cursor-pointer hover:underline">Help</span>
        </p>
        <p>&copy; {new Date().getFullYear()} Ashesi DWA, Inc. All rights reserved.</p>
    </footer>
);

export default Footer;
