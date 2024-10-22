import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { AdminRoutes } from '../app/modules/admin/admin.routes';
import { BrandRoutes } from '../app/modules/brand/brand.route';
import { InfluencerRoutes } from '../app/modules/influencer/influencer.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { CampaignRoutes } from '../app/modules/campaign/campaign.route';
import { DiscountClubRoutes } from '../app/modules/discountClub/discountClub.route';
import { RequirementRoutes } from '../app/modules/requirement/requirement.route';
import { InviteRoutes } from '../app/modules/invite/invite.route';
import { CollaborationRoutes } from '../app/modules/collaboration/collaboration.route';
import { FaqRoutes } from '../app/modules/Faq/Faq.route';
import { ReviewRoutes } from '../app/modules/review/review.route';
import { PermissonRoutes } from '../app/modules/permission_access/permission.route';
import { TermsAndConditionRoutes } from '../app/modules/termsAndCondition/termsAndCondition.route';
import { InterestRoutes } from '../app/modules/interest_influencer/interest.route';
import { SubscriptionRoutes } from '../app/modules/subscribtion/subscribtion.route';
import { SubscriptationRoutes } from '../app/modules/subscribation/subscribation.route';
const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },
  { path: '/admin', route: AdminRoutes },
  { path: '/brand', route: BrandRoutes },
  { path: '/influencer', route: InfluencerRoutes },
  { path: '/category', route: CategoryRoutes },
  { path: '/campaign', route: CampaignRoutes },
  { path: '/discount', route: DiscountClubRoutes },
  { path: '/requirement', route: RequirementRoutes },
  { path: '/invite', route: InviteRoutes },
  { path: '/collaboration', route: CollaborationRoutes },
  { path: '/faq', route: FaqRoutes },
  { path: '/review', route: ReviewRoutes },
  { path: '/permisson', route: PermissonRoutes },
  { path: '/terms', route: TermsAndConditionRoutes },
  { path: '/subscribtion', route: SubscriptionRoutes },
  { path: '/interest-influencer', route: InterestRoutes },
  { path: '/subscriptation', route: SubscriptationRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
