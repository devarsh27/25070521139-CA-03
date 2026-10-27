/**
 * @desc   Handle contact inquiries
 * @route  POST /api/contact
 * @access Public
 */
export const submitContact = async (req, res, next) => {
  try {
    const { name, email, department, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name, email, and message.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    // In production, this can send an email or store in a Contact message collection.
    res.status(200).json({
      success: true,
      message: 'Thank you! Your inquiry has been received. Our campus sentiment team will respond shortly.',
      data: {
        name,
        email,
        department: department || 'General Inquiry',
        subject: subject || 'Campus Feedback Inquiry',
        receivedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { submitContact };
