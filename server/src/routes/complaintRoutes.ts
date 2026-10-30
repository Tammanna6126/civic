import { Router } from 'express';
import {
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  reviewDuplicate
} from '../controllers/complaintController';

const router = Router();

router.post('/submit', submitComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', updateComplaintStatus);
router.post('/:id/assign', assignComplaint);
router.post('/:id/review-duplicate', reviewDuplicate);

export default router;
