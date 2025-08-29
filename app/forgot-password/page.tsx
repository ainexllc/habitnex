'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { theme } from '@/lib/theme';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await resetPassword(data.email);
      setMessage('Check your inbox for further instructions');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.gradients.pageBackground} flex items-center justify-center p-4`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className={`text-2xl text-center ${theme.text.primary}`}>
            Reset Password
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />
            
            {error && (
              <div className={`text-sm ${theme.status.error.text} text-center p-3 ${theme.status.error.bg} rounded-lg`}>
                {error}
              </div>
            )}
            
            {message && (
              <div className={`text-sm ${theme.status.success.text} text-center p-3 ${theme.status.success.bg} rounded-lg`}>
                {message}
              </div>
            )}
            
            <Button type="submit" className="w-full" loading={loading}>
              Reset Password
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className={`text-sm ${theme.text.link} hover:underline`}
            >
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}