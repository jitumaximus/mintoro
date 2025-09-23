import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy - Mintoro";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Mintoro Privacy Policy - Learn how we collect, use, and protect your personal information for our educational consulting services.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Mintoro Privacy Policy - Learn how we collect, use, and protect your personal information for our educational consulting services.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8" data-testid="text-privacy-title">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6" data-testid="text-last-updated">
              <strong>Last Updated:</strong> September 23, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Data Controller and Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Mintoro Education Consulting Private Limited ("we," "our," or "us") is the data controller responsible for your personal information. We are committed to protecting your privacy and ensuring the security of your personal data in compliance with applicable data protection laws including the Digital Personal Data Protection Act, 2023 (DPDP Act).
              </p>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="font-medium">Data Controller Contact Details:</p>
                <p className="text-muted-foreground">Mintoro Education Consulting Private Limited</p>
                <p className="text-muted-foreground">Email: privacy@mintoro.com</p>
                <p className="text-muted-foreground">Phone: +91-98765-43210</p>
                <p className="text-muted-foreground">Address: 123 Business Park, Sector 18, Gurgaon, Haryana 122015, India</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect the following types of personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Contact information (name, email address, phone number)</li>
                <li>Educational background and career information</li>
                <li>Course enrollment and progress data</li>
                <li>Payment and billing information</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Technical Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Website usage and interaction data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We process your personal data for the following purposes with corresponding lawful bases:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-medium">Contract Performance:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Provide and deliver educational consulting services</li>
                    <li>Process course enrollments and payments</li>
                    <li>Manage your account and course access</li>
                  </ul>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-medium">Legitimate Interest:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Improve our website and services</li>
                    <li>Prevent fraud and ensure security</li>
                    <li>Analyze usage patterns for service enhancement</li>
                  </ul>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-medium">Consent:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Send educational content and newsletters</li>
                    <li>Marketing communications about new courses</li>
                    <li>Cookies and tracking technologies (where required)</li>
                  </ul>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-medium">Legal Obligation:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    <li>Comply with tax and accounting requirements</li>
                    <li>Respond to legal requests and court orders</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our website and delivering our services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict processing of your information</li>
                <li>Data portability</li>
                <li>Withdraw consent (where processing is based on consent)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@mintoro.com with proof of identity. We will respond within 30 days of receiving your request. If you are unsatisfied with our response, you have the right to lodge a complaint with the Data Protection Board of India.
              </p>
              <div className="bg-muted p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2">Data Subject Request Process:</h4>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                  <li>Send your request to privacy@mintoro.com</li>
                  <li>Include proof of identity (copy of government ID)</li>
                  <li>Specify the right you wish to exercise</li>
                  <li>We will acknowledge receipt within 72 hours</li>
                  <li>Response provided within 30 days maximum</li>
                </ol>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy and Educational Records</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We take special care to protect the privacy of children and comply with applicable laws:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li><strong>Under 13:</strong> We do not knowingly collect personal information from children under 13 without verified parental consent</li>
                <li><strong>Ages 13-18:</strong> We require parental consent for enrollment and implement enhanced privacy safeguards</li>
                <li><strong>Educational Records:</strong> Student progress data is protected with encryption and access controls</li>
                <li><strong>Parental Rights:</strong> Parents can review, modify, or delete their child's information at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                If you believe we have collected information from a child without proper consent, contact us immediately at privacy@mintoro.com.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Account Data:</strong> Retained while account is active plus 3 years after closure</li>
                <li><strong>Course Data:</strong> Retained for 7 years after course completion for educational records</li>
                <li><strong>Payment Records:</strong> Retained for 7 years for tax and accounting compliance</li>
                <li><strong>Marketing Consent:</strong> Until consent is withdrawn or account is closed</li>
                <li><strong>Website Analytics:</strong> Anonymized after 26 months</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies and similar technologies with your consent. Here's how we categorize and use them:
              </p>
              <div className="space-y-4">
                <div className="border border-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Essential Cookies (Always Active)</h4>
                  <p className="text-muted-foreground text-sm">Required for website functionality, security, and user authentication</p>
                </div>
                <div className="border border-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Analytics Cookies (Consent Required)</h4>
                  <p className="text-muted-foreground text-sm">Help us understand website usage and improve our services</p>
                </div>
                <div className="border border-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Marketing Cookies (Consent Required)</h4>
                  <p className="text-muted-foreground text-sm">Used to deliver relevant advertisements and track campaign effectiveness</p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can manage your cookie preferences through our cookie banner or browser settings. Disabling certain cookies may affect website functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your personal data is primarily processed within India. When we transfer data internationally, we implement appropriate safeguards:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection (EU, UK)</li>
                <li><strong>Standard Contractual Clauses:</strong> For transfers to other countries with approved SCC frameworks</li>
                <li><strong>Service Providers:</strong> Cloud hosting and payment processing with data localization commitments</li>
                <li><strong>Cross-Border Restrictions:</strong> No transfers to countries with inadequate data protection without explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after such modifications constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Mintoro Education Consulting</p>
                <p className="text-muted-foreground">Email: privacy@mintoro.com</p>
                <p className="text-muted-foreground">Phone: +91-98765-43210</p>
                <p className="text-muted-foreground">Address: 123 Business Park, Sector 18, Gurgaon, Haryana 122015, India</p>
                <p className="text-muted-foreground">Data Protection Officer: dpo@mintoro.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}