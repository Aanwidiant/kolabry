'use client';

import React, { useEffect, useState } from 'react';

type GreetingProps = {
    name: string;
    role: string;
};

export default function Greeting({ name, role }: GreetingProps) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const now = new Date();
        const delayUntilNextMinute = (60 - now.getSeconds()) * 1000;

        const timeout = setTimeout(() => {
            setCurrentTime(new Date());

            const interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 60_000);

            return () => clearInterval(interval);
        }, delayUntilNextMinute);

        return () => clearTimeout(timeout);
    }, []);

    const getGreetingTime = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        if (hour < 20) return 'Good evening';
        return 'Good night';
    };

    const formatDate = (date: Date) =>
        date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <div className='space-y-2 text-dark'>
            <h1 className='text-2xl md:text-3xl font-semibold'>
                {getGreetingTime()}, {name}
            </h1>
            <p className='text-xl'>Welcome back to Kolabry, hope you have a great day!</p>
            <p className='text-gray'>
                {formatDate(currentTime)}, {formatTime(currentTime)}
            </p>
            <p className='text-gray'>
                You are logged in as <span className='font-medium capitalize'>{role}</span>
            </p>
        </div>
    );
}
