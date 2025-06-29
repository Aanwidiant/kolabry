export default function StatusBadge(status: string) {
    const base = 'px-2 py-1 rounded-md text-xs font-semibold';
    switch (status) {
        case 'ongoing':
            return <span className={`${base} bg-info text-light`}>Ongoing</span>;
        case 'upcoming':
            return <span className={`${base} bg-warning text-dark`}>Upcoming</span>;
        case 'finished':
            return <span className={`${base} bg-success text-light`}>Finished</span>;
        default:
            return <span className={`${base} bg-error text-light`}>Unknown</span>;
    }
}
