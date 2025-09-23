import { useEffect } from "react";

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service - Mintoro";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Mintoro Terms of Service - Legal terms and conditions for using our premium educational consulting services.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Mintoro Terms of Service - Legal terms and conditions for using our premium educational consulting services.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8" data-testid="text-terms-title">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms and Eligibility</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to Mintoro Education Consulting Private Limited. These Terms of Service ("Terms") govern your use of our website and educational consulting services. By accessing or using our services, you agree to be bound by these Terms.
              </p>
              <h3 className="text-xl font-medium mb-3">Eligibility Requirements</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You must be at least 18 years old to create an account independently</li>
                <li>Users aged 13-17 require parental consent and supervision</li>
                <li>You must provide accurate and truthful information</li>
                <li>You must have the legal authority to enter into this agreement</li>
                <li>You must not be prohibited from using our services under applicable law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Mintoro provides premium educational consulting services including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Personal Development Mastery:</strong> Comprehensive self-improvement coaching and strategies</li>
                <li><strong>Career Counselling Excellence:</strong> Professional career guidance and planning services</li>
                <li><strong>Financial Freedom Mastery:</strong> Financial literacy, investment guidance, and wealth-building strategies</li>
                <li>One-on-one consultations and group sessions</li>
                <li>Educational materials and resources</li>
                <li>Progress tracking and ongoing support</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Course Enrollment and Fees</h2>
              
              <h3 className="text-xl font-medium mb-3">Course Pricing</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Current course pricing is available on our courses page at <a href="/courses" className="text-primary hover:underline">mintoro.app/courses</a>. Pricing may vary based on promotions, bundles, and payment plans offered at the time of enrollment.
              </p>

              <h3 className="text-xl font-medium mb-3">Payment Terms</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Payment must be completed before accessing course materials</li>
                <li>We accept credit cards, debit cards, UPI, and net banking</li>
                <li>All prices are in Indian Rupees (INR) and include applicable GST</li>
                <li>Payment plans may be available for eligible courses</li>
                <li>Failed payments may result in service suspension</li>
              </ul>
              <h3 className="text-xl font-medium mb-3">Chargebacks and Disputes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unauthorized chargebacks may result in account suspension. Please contact our support team at contact@mintoro.com before initiating any payment disputes to resolve issues amicably.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Refund and Cancellation Policy</h2>
              
              <h3 className="text-xl font-medium mb-3">Cooling-off Period</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may cancel your enrollment within 7 days of purchase for a full refund, provided you have not accessed more than 20% of the course content.
              </p>

              <h3 className="text-xl font-medium mb-3">Partial Refunds</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                After the cooling-off period, refunds may be considered on a case-by-case basis for extraordinary circumstances. Refund requests must be submitted in writing to contact@mintoro.com.
              </p>

              <h3 className="text-xl font-medium mb-3">Non-Refundable Items</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>One-on-one consultation sessions that have been conducted</li>
                <li>Completed course modules</li>
                <li>Downloaded materials and resources</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. User Responsibilities and Prohibited Conduct</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By using our services, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use our services only for lawful purposes</li>
                <li>Respect intellectual property rights</li>
                <li>Participate actively and professionally in all sessions</li>
                <li>Keep your account information current and accurate</li>
              </ul>
              
              <h3 className="text-xl font-medium mb-3">Prohibited Conduct</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Sharing login credentials or course materials with unauthorized individuals</li>
                <li>Recording, copying, or distributing course content without permission</li>
                <li>Using automated tools to access our services</li>
                <li>Attempting to breach security measures or access restricted areas</li>
                <li>Submitting false or misleading information</li>
                <li>Harassing, threatening, or abusing other users or staff</li>
                <li>Using our services for illegal activities or spam</li>
                <li>Reverse engineering or attempting to extract source code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property Rights</h2>
              
              <h3 className="text-xl font-medium mb-3">Our Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All course materials, including but not limited to text, graphics, videos, audio recordings, and software, are owned by Mintoro and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium mb-3">Limited License</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We grant you a limited, non-exclusive, non-transferable license to access and use our course materials solely for your personal educational purposes. You may not reproduce, distribute, modify, or create derivative works without our written consent.
              </p>

              <h3 className="text-xl font-medium mb-3">User-Generated Content</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain ownership of any content you submit during our services. By submitting content, you grant us a non-exclusive license to use, modify, and display such content for educational and promotional purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Confidentiality</h2>
              <p className="text-muted-foreground leading-relaxed">
                We maintain strict confidentiality regarding all information shared during consultations and course participation. We expect the same level of confidentiality from participants regarding information shared by other participants during group sessions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations of Liability</h2>
              
              <h3 className="text-xl font-medium mb-3">Service Disclaimers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                OUR SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Educational content is for general guidance only, not professional advice</li>
                <li>No guarantee of specific career, financial, or personal outcomes</li>
                <li>Service availability may be interrupted for maintenance or technical issues</li>
                <li>Third-party integrations and external links are beyond our control</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">Limitation of Liability</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Our total liability shall not exceed the amount you paid for our services in the 12 months preceding the claim</li>
                <li>We are not liable for indirect, incidental, special, consequential, or punitive damages</li>
                <li>We are not responsible for lost profits, data loss, or business interruption</li>
                <li>These limitations apply even if we have been advised of the possibility of such damages</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Service Availability and Modifications</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Modify, suspend, or discontinue any aspect of our services with 30 days' notice</li>
                <li>Update course content and materials to maintain relevance and quality</li>
                <li>Implement scheduled maintenance that may temporarily affect service access</li>
                <li>Adjust pricing and service terms with advance notification to existing users</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Force Majeure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We shall not be liable for any delay or failure to perform due to circumstances beyond our reasonable control, including natural disasters, government actions, pandemics, internet outages, or acts of terrorism. During such events, we will make reasonable efforts to minimize service disruption.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Termination and Account Closure</h2>
              
              <h3 className="text-xl font-medium mb-3">Termination by Us</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may terminate or suspend your access immediately for violations of these Terms, including prohibited conduct, payment failures, or harmful behavior.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Termination by You</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You may close your account at any time by contacting contact@mintoro.com. Account closure does not automatically entitle you to refunds for unused services.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Effect of Termination</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Immediate loss of access to courses and materials</li>
                <li>Data retention according to our Privacy Policy</li>
                <li>Survival of payment obligations and intellectual property rights</li>
                <li>Continuing effect of limitation of liability and dispute resolution clauses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution and Governing Law</h2>
              
              <h3 className="text-xl font-medium mb-3">Governing Law</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Faridabad, Haryana, India.
              </p>
              
              <h3 className="text-xl font-medium mb-3">Dispute Resolution Process</h3>
              <ol className="list-decimal list-inside text-muted-foreground space-y-2">
                <li><strong>Direct Communication:</strong> Contact contact@mintoro.com to resolve issues informally</li>
                <li><strong>Mediation:</strong> If direct resolution fails, disputes may be referred to mediation</li>
                <li><strong>Arbitration:</strong> Unresolved disputes shall be settled by arbitration under the Arbitration and Conciliation Act, 2015</li>
                <li><strong>Court Proceedings:</strong> As a final resort, disputes may be heard in Faridabad courts</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our website. Your continued use of our services after such modifications constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Mintoro Education Consulting</p>
                <p className="text-muted-foreground">Email: contact@mintoro.com</p>
                <p className="text-muted-foreground">Address: Faridabad, Haryana, India</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining Terms will otherwise remain in full force and effect.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}