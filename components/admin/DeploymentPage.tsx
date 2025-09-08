
import React, { useState } from 'react';
import { supabase } from '../../services/supabase';

const DeploymentPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | 'info' | ''>('');

    const handleDeploy = async () => {
        console.log('[Deploy] Button clicked. Starting deployment process...');

        setLoading(true);
        setMessage('Triggering deployment, please wait...');
        setMessageType('info');
        console.log('[Deploy] UI state set to "loading".');
        
        try {
            console.log('[Deploy] Attempting to insert into "Build" table...');
            // Insert a new row into the "Build" table to trigger the deployment hook.
            const { error } = await supabase.from('Build').insert([{}]);

            console.log('[Deploy] Supabase request finished.');

            if (error) {
                console.error('[Deploy] Supabase returned an error:', error);
                throw error;
            }

            const successMsg = 'Deployment successfully triggered! It may take a few minutes for changes to appear on the live site.';
            setMessage(successMsg);
            setMessageType('success');
            console.log('[Deploy] Deployment triggered successfully.');

        } catch (err: any) {
            console.error("[Deploy] Caught an error during deployment:", err);
            
            let detailedError = "An error occurred while triggering the deployment.\n\nFull error details:\n";
            detailedError += JSON.stringify(err, Object.getOwnPropertyNames(err), 2);

            if (err.message && (err.message.includes('permission denied') || err.message.includes('violates row-level security policy'))) {
                detailedError += "\n\n--- DEBUGGING HINT ---\n";
                detailedError += "This appears to be a Row Level Security (RLS) permission error.\n\n";
                detailedError += "Please go to your Supabase dashboard, navigate to 'Authentication' -> 'Policies', select the 'Build' table, and ensure you have a policy that allows authenticated users to INSERT.\n\n";
                detailedError += "Here is an example policy you can run in the Supabase SQL Editor. You may need to delete any existing conflicting policies on the 'Build' table first:\n\n";
                detailedError += "CREATE POLICY \"Allow authenticated users to trigger builds\" \nON public.\"Build\" \nFOR INSERT \nTO authenticated \nWITH CHECK (true);";
            }
            
            setMessage(detailedError);
            setMessageType('error');
            console.log('[Deploy] UI state set to "error".');
        } finally {
            setLoading(false);
            console.log('[Deploy] Process finished. Loading state set to false.');
        }
    };

    return (
        <div className="container mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Deploy Website</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
                Clicking the button below will trigger a new build and deployment of the website. 
                All the changes you have saved in the admin panel will be published to the live site. 
                This process may take several minutes to complete.
            </p>
            
            <div className="flex flex-col items-start gap-4">
                <button
                    onClick={handleDeploy}
                    disabled={loading}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                    aria-live="polite"
                >
                    <span className="material-icons mr-2" aria-hidden="true">{loading ? 'hourglass_top' : 'cloud_upload'}</span>
                    {loading ? 'Deployment in Progress...' : 'Deploy Changes to the Website'}
                </button>

                {message && (
                    <div className={`w-full p-4 rounded-md text-sm whitespace-pre-wrap font-mono ${
                        messageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : ''
                    } ${
                        messageType === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' : ''
                    } ${
                        messageType === 'info' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200' : ''
                    }`}
                    role="alert">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeploymentPage;
