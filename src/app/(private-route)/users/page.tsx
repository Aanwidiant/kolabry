'use client';
import { Edit, Eye, Trash, Users } from '@/components/icons';
import SearchInput from '@/components/globals/search-input';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import PaginationLimit from '@/components/globals/pagination-limit';
import Fetch from '@/utilities/fetch';
import Pagination from '@/components/globals/pagination';
import SpinnerLoader from '@/components/globals/spinner-loader';
import { ActionButton } from '@/components/globals/action-button';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleLimitChange = (value: string | number) => {
        const parsed = typeof value === 'string' ? parseInt(value) : value;
        setLimit(parsed);
        setPage(1);
    };

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams({
                    page: String(page),
                    limit: String(limit),
                    search,
                });

                const response = await Fetch.GET(`/user?${query.toString()}`);

                setUsers(response.data || []);
                setTotalPages(response.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        getUsers().then();
    }, [page, limit, search]);

    return (
        <main className='pb-10'>
            <div className='w-full h-16 border-b border-gray flex gap-3 items-center px-6'>
                <Users className='w-8 h-8 fill-dark' />
                <span className='text-lg font-semibold'>User</span>
            </div>
            <div className='py-3 px-6 flex flex-wrap gap-3'>
                <SearchInput onSearch={setSearch} search={'username, email'} />
                <PaginationLimit value={limit} onChange={handleLimitChange} />
            </div>
            <div className='py-3 px-6'>
                <div className='overflow-x-auto rounded-lg border border-gray'>
                    <table className='min-w-full text-sm'>
                        <thead className='border-b border-gray'>
                            <tr className='bg-primary/50'>
                                <th className='w-16 text-center p-4 rounded-tl-lg'>
                                    No
                                </th>
                                <th className='text-center p-4'>Username</th>
                                <th className='text-center p-4'>Email</th>
                                <th className='text-center p-4'>Role</th>
                                <th className='text-center p-4 rounded-tr-lg'>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className='py-4 text-center'
                                    >
                                        <SpinnerLoader scale='scale-80' />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className='text-center py-4 text-xl font-semibold'
                                    >
                                        Data not found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user, index) => {
                                    const isLast = index === users.length - 1;
                                    return (
                                        <tr
                                            key={user.id}
                                            className={`bg-light ${isLast ? '' : 'border-b border-gray'} `}
                                        >
                                            <td
                                                className={`text-center px-4 py-2 ${isLast ? 'rounded-bl-lg' : ''}`}
                                            >
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className='px-4 py-2 text-left'>
                                                {user.username}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {user.email}
                                            </td>
                                            <td className='px-4 py-2 text-right'>
                                                {user.role}
                                            </td>
                                            <td
                                                className={`px-4 py-2 text-center ${isLast ? 'rounded-br-lg' : ''}`}
                                            >
                                                <div className='flex justify-center gap-2'>
                                                    <ActionButton
                                                        icon={
                                                            <Eye className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                        }
                                                        tooltipText='Detail'
                                                    />
                                                    <ActionButton
                                                        icon={
                                                            <Edit className='w-6 h-6 fill-dark group-hover:fill-light' />
                                                        }
                                                        tooltipText='Edit'
                                                    />
                                                    <ActionButton
                                                        icon={
                                                            <Trash className='w-6 h-6 text-error' />
                                                        }
                                                        tooltipText='Delete'
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <Pagination
                        totalPages={totalPages}
                        currentPage={page}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                )}
            </div>
        </main>
    );
}
