import React from 'react';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen pt-32 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-heading text-4xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
                <div className="prose prose-lg text-gray-700 space-y-6">
                    <p>
                        At Roaming Roads, we believe in authentic travel and an authentic web experience. We respect your privacy and autonomy.
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Data Collection</h2>
                        <p>
                            We do not collect, store, or process any personal information from our visitors. When you browse our adventures, read our stories, or view our maps, you do so completely anonymously.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Cookies</h2>
                        <p>
                            This website is free of cookies. We do not use any tracking scripts, analytics trackers, or third-party advertising cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">External Links</h2>
                        <p>
                            Our articles may contain links to external websites (such as maps, museums, or parks). We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review their privacy policies if you choose to visit them.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Contact Us</h2>
                        <p>
                            If you have any questions about our privacy practices, please contact us at <a href="mailto:hello@roamingroads.nl" className="text-orange-600 hover:underline">hello@roamingroads.nl</a>.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
