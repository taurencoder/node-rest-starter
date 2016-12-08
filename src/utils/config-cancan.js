import cancan from 'cancan';
import User from '../models/user';
import Role from '../models/role';

export default (user) => {
  cancan.configure(User, function () {
    const userId = user.get('id');
    const role = user.related('role').get('name');

    if (role === Role.type.ADMIN) {
      this.can('manage', 'all');
    } else {
      this.can('manage', User,
        target => Number(target.get('id')) === Number(userId)
      );
    }
  });
};
