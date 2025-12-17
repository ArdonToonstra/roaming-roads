import React from 'react';

export default function TermsPage() {
    return (
        <main className="min-h-screen pt-32 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="font-heading text-4xl font-bold mb-8 text-gray-900">Terms of Use</h1>
                <div className="prose prose-lg text-gray-700 space-y-6">
                    <p>
                        Welcome to Roaming Roads. By accessing or using our website, you agree to be bound by these Terms of Use.
                    </p>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Intellectual Property</h2>
                        <p>
                            All content on this website, including but not limited to text, photography, graphics, logos, and maps, is the exclusive property of Roaming Roads, unless otherwise stated.
                        </p>
                        <p className="font-medium">
                            You may not copy, reproduce, Republish, upload, post, transmit, or distribute any material from this site in any way without our prior written consent.
                        </p>
                        <p>
                            Unauthorized use of our images or content acts as a violation of copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Disclaimer of Warranties</h2>
                        <p>
                            The information provided on Roaming Roads is for general informational and entertainment purposes only. While we strive to provide up-to-date and accurate information regarding travel destinations, hours, and conditions, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability of the information.
                        </p>
                        <p>
                            <strong>Use at your own risk.</strong> Travel conditions change rapidly. We are not liable for any loss, injury, or inconvenience sustained by any person resulting from information published on this site.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Limitation of Liability</h2>
                        <p>
                            In no event shall Roaming Roads be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Governing Law</h2>
                        <p>
                            These terms shall be governed by and construed in accordance with the laws of the Netherlands. Any disputes relating to these terms shall be subject to the exclusive jurisdiction of the courts of the Netherlands.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
