import React from 'react'

const ReportButton = ({ vitals, scenarioRef, riskLevel }) => {
	const generate = async () => {
		try {
			const { default: jsPDF } = await import('jspdf')
			const doc = new jsPDF()
			const now = new Date()
			doc.setFontSize(18)
			doc.text('AI Clinic Booking Slip', 14, 20)
			doc.setFontSize(11)
			doc.text(`Generated: ${now.toLocaleString()}`, 14, 28)
			doc.text(`Scenario: ${scenarioRef?.current || 'ai-clinic'}`, 14, 36)
			doc.text(`Risk: ${riskLevel}`, 14, 44)
			doc.setDrawColor(200)
			doc.line(14, 48, 196, 48)

			let y = 60
			doc.setFontSize(14)
			doc.text('Booking Details', 14, y); y += 8
			doc.setFontSize(12)
			const ap = vitals?.appointment
			if (ap) {
				doc.text(`Ticket ID: ${ap.id || '-'}`, 14, y); y += 8
				doc.text(`Name: ${ap.name || '-'}`, 14, y); y += 8
				doc.text(`Phone: ${ap.phone || '-'}`, 14, y); y += 8
				doc.text(`Preferred time: ${ap.preferred_time || '-'}`, 14, y); y += 8
				doc.text(`Reason: ${ap.reason || '-'}`, 14, y); y += 8
				doc.text(`Clinic: ${ap.clinic || '-'}`, 14, y); y += 8
				if (ap.directions) { doc.text(`Directions: ${ap.directions}`, 14, y, { maxWidth: 180 }); y += 8 }
			} else {
				doc.text('No booking found.', 14, y); y += 8
			}

			doc.setFontSize(14)
			doc.text('Symptom Check', 14, y); y += 8
			doc.setFontSize(12)
			const tr = vitals?.triageResult
			if (tr) {
				doc.text(`Risk: ${tr.risk_level} (score ${tr.score})`, 14, y); y += 8
				doc.text(`Summary: ${tr.summary}`, 14, y, { maxWidth: 180 }); y += 8
				if (tr.recommendations?.length) {
					doc.text('Recommendations:', 14, y); y += 8
					tr.recommendations.forEach((r) => { doc.text(`• ${r}`, 18, y, { maxWidth: 176 }); y += 6 })
				}
			} else {
				doc.text('No symptom check available.', 14, y); y += 8
			}

			doc.setFontSize(14)
			doc.text('Cough Check', 14, y); y += 8
			doc.setFontSize(12)
			if (vitals?.coughDetected) {
				doc.text('Cough: Detected (flu-like)', 14, y); y += 8
			} else {
				doc.text('Cough: Not detected or not flu-like', 14, y); y += 8
			}

			// Footer
			doc.setFontSize(10)
			doc.text('Not a diagnosis. Present this slip at the clinic. Seek urgent care for severe symptoms.', 14, 285, { maxWidth: 180 })
			doc.save(`AIClinic_Slip_${now.getTime()}.pdf`)
		} catch (e) {
			console.error('Failed to generate PDF:', e)
		}
	}
	return (
		<button onClick={generate} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
			📄 Generate PDF Report
		</button>
	)
}

export default ReportButton