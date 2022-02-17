dnf -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-$(rpm -q --provides $(rpm -q --whatprovides "system-release(releasever)") | grep "system-release(releasever)" | cut -d " " -f 3).noarch.rpm:
  cmd.run: []

dnf -y install dnf-plugins-core:
  cmd.run: []

dnf -y config-manager --set-enabled powertools 2> /dev/null || echo 'OK':
  cmd.run: []

dnf -y config-manager --set-enabled PowerTools 2> /dev/null || echo 'OK':
  cmd.run: []

dnf -y config-manager --set-enabled ol8_codeready_builder 2> /dev/null || echo 'OK':
  cmd.run: []

dnf -y install epel-release:
  cmd.run: []
